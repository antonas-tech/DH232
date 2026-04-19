"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { BUCKETS } from "@/lib/storage";
import { slugify } from "@/lib/utils";

type RoundFormData = {
  id?: string;
  title?: string;
  description?: string | null;
  coverUrl?: string | null;
  samplePackUrl?: string | null;
  samplePackPath?: string | null;
  status?: string;
  rules?: { bpm?: string; genre?: string; notes?: string } | null;
  prizePool?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  timeLimitMinutes?: number | null;
};

const STATUSES = ["DRAFT", "REGISTRATION", "ACTIVE", "JUDGING", "FINISHED"];

export function RoundForm({ round }: { round?: RoundFormData }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [busy, setBusy] = React.useState(false);
  const [uploadingPack, setUploadingPack] = React.useState(false);
  const [uploadingCover, setUploadingCover] = React.useState(false);

  const [form, setForm] = React.useState({
    title: round?.title ?? "",
    description: round?.description ?? "",
    coverUrl: round?.coverUrl ?? "",
    samplePackUrl: round?.samplePackUrl ?? "",
    samplePackPath: round?.samplePackPath ?? "",
    status: round?.status ?? "DRAFT",
    bpm: round?.rules?.bpm ?? "",
    genre: round?.rules?.genre ?? "",
    notes: round?.rules?.notes ?? "",
    prizePool: round?.prizePool ?? "",
    startDate: round?.startDate ? round.startDate.slice(0, 16) : "",
    endDate: round?.endDate ? round.endDate.slice(0, 16) : "",
    timeLimitMinutes: round?.timeLimitMinutes?.toString() ?? "30",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadFile(
    bucket: string,
    file: File,
    setUrl: (url: string, path: string) => void,
  ) {
    const ext = file.name.split(".").pop();
    const path = `${slugify(form.title || "round")}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: false, contentType: file.type });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    setUrl(data.publicUrl, path);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        coverUrl: form.coverUrl || null,
        samplePackUrl: form.samplePackUrl || null,
        samplePackPath: form.samplePackPath || null,
        status: form.status,
        rules: {
          bpm: form.bpm || undefined,
          genre: form.genre || undefined,
          notes: form.notes || undefined,
        },
        prizePool: form.prizePool || null,
        startDate: form.startDate ? new Date(form.startDate) : null,
        endDate: form.endDate ? new Date(form.endDate) : null,
        timeLimitMinutes: form.timeLimitMinutes
          ? Number(form.timeLimitMinutes)
          : null,
      };

      const res = await fetch(
        round?.id ? `/api/admin/rounds/${round.id}` : "/api/admin/rounds",
        {
          method: round?.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      const data = await res.json();
      toast.success(round?.id ? "Round updated" : "Round created");
      router.push(`/admin/rounds/${data.id ?? round?.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Round 01 — Trap Cypher"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief, vibe, theme…"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label>BPM</Label>
              <Input
                value={form.bpm}
                onChange={(e) => set("bpm", e.target.value)}
                placeholder="140"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Genre</Label>
              <Input
                value={form.genre}
                onChange={(e) => set("genre", e.target.value)}
                placeholder="Trap / Phonk / Boom-bap"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Prize pool</Label>
              <Input
                value={form.prizePool}
                onChange={(e) => set("prizePool", e.target.value)}
                placeholder="$300 + Splice gift"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes / extra rules</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Use at least 3 sounds from the pack…"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Time limit (minutes)</Label>
              <Input
                type="number"
                min={0}
                value={form.timeLimitMinutes}
                onChange={(e) => set("timeLimitMinutes", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Start date</Label>
              <Input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-1.5 md:col-start-3">
              <Label>End date</Label>
              <Input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="text-display text-sm uppercase tracking-widest">
            Assets
          </div>

          <div className="space-y-2">
            <Label>Cover image</Label>
            <div className="flex items-center gap-3">
              <Input
                value={form.coverUrl}
                onChange={(e) => set("coverUrl", e.target.value)}
                placeholder="https://… or upload"
              />
              <FileUpload
                accept="image/*"
                disabled={uploadingCover}
                label="Upload cover"
                onPick={async (file) => {
                  setUploadingCover(true);
                  try {
                    await uploadFile(BUCKETS.covers, file, (url) =>
                      set("coverUrl", url),
                    );
                    toast.success("Cover uploaded");
                  } catch (err) {
                    toast.error(
                      err instanceof Error ? err.message : "Upload failed",
                    );
                  } finally {
                    setUploadingCover(false);
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sample pack (.zip)</Label>
            <div className="flex items-center gap-3">
              <Input
                value={form.samplePackUrl}
                onChange={(e) => set("samplePackUrl", e.target.value)}
                placeholder="https://…/pack.zip or upload"
              />
              <FileUpload
                accept=".zip,application/zip,application/x-zip-compressed"
                disabled={uploadingPack}
                label="Upload pack"
                onPick={async (file) => {
                  setUploadingPack(true);
                  try {
                    await uploadFile(BUCKETS.samples, file, (url, path) => {
                      set("samplePackUrl", url);
                      set("samplePackPath", path);
                    });
                    toast.success("Sample pack uploaded");
                  } catch (err) {
                    toast.error(
                      err instanceof Error ? err.message : "Upload failed",
                    );
                  } finally {
                    setUploadingPack(false);
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save round"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function FileUpload({
  accept,
  disabled,
  label,
  onPick,
}: {
  accept: string;
  disabled?: boolean;
  label: string;
  onPick: (file: File) => void;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => ref.current?.click()}
      >
        {disabled ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Upload className="h-4 w-4" /> {label}
          </>
        )}
      </Button>
    </>
  );
}
