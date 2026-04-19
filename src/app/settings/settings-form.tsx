"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { BUCKETS } from "@/lib/storage";

type Props = {
  user: {
    username: string;
    bio: string;
    avatarUrl: string;
    links: Record<string, string>;
  };
};

const LINK_KEYS = ["soundcloud", "instagram", "twitter", "youtube"] as const;

export function SettingsForm({ user }: Props) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [busy, setBusy] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [form, setForm] = React.useState({
    username: user.username,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    links: { ...Object.fromEntries(LINK_KEYS.map((k) => [k, ""])), ...user.links },
  });

  async function uploadAvatar(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Image required");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.username}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKETS.avatars)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from(BUCKETS.avatars).getPublicUrl(path);
      setForm((f) => ({ ...f, avatarUrl: data.publicUrl }));
      toast.success("Avatar uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      toast.success("Saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={form.avatarUrl || undefined} />
              <AvatarFallback>{form.username.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label>Avatar</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  value={form.avatarUrl}
                  onChange={(e) =>
                    setForm({ ...form, avatarUrl: e.target.value })
                  }
                  placeholder="https://…"
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadAvatar(f);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-4 w-4" /> Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              maxLength={400}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Lo-fi gremlin from Brooklyn / 909 enjoyer / etc."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="text-display text-sm uppercase tracking-widest">
            Links
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {LINK_KEYS.map((k) => (
              <div key={k} className="space-y-1.5">
                <Label htmlFor={k}>{k}</Label>
                <Input
                  id={k}
                  value={form.links[k] ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      links: { ...form.links, [k]: e.target.value },
                    })
                  }
                  placeholder={`https://${k}.com/@you`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
      </Button>
    </form>
  );
}
