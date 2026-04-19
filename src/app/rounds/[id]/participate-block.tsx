"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Loader2, Music2, Play, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { BUCKETS } from "@/lib/storage";
import { cn } from "@/lib/utils";

type Props = {
  round: {
    id: string;
    timeLimitMinutes: number | null;
    samplePackUrl: string | null;
  };
  participant: {
    id: string;
    status: string;
    startedAt: string | null;
    hasSubmission: boolean;
  } | null;
};

function useCountdown(targetMs: number | null) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!targetMs) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [targetMs]);
  if (!targetMs) return { remaining: 0, expired: false };
  const remaining = Math.max(0, targetMs - now);
  return { remaining, expired: remaining === 0 };
}

function format(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function RoundParticipateBlock({ round, participant }: Props) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const startedAt = participant?.startedAt
    ? new Date(participant.startedAt).getTime()
    : null;
  const limitMs = round.timeLimitMinutes
    ? round.timeLimitMinutes * 60_000
    : null;
  const targetMs = startedAt && limitMs ? startedAt + limitMs : null;
  const { remaining, expired } = useCountdown(targetMs);
  const expiredEffective =
    Boolean(targetMs) && expired && !participant?.hasSubmission;

  async function handleJoin() {
    setBusy(true);
    try {
      const res = await fetch(`/api/rounds/${round.id}/join`, {
        method: "POST",
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      toast.success("You're in. Sample pack unlocked.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setBusy(false);
    }
  }

  async function handleStart() {
    setBusy(true);
    try {
      const res = await fetch(`/api/rounds/${round.id}/start`, {
        method: "POST",
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      toast.success("Timer started — go!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start");
    } finally {
      setBusy(false);
    }
  }

  if (!participant) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Вступай в раунд, чтобы получить доступ к сэмпл-паку и слоту загрузки.
        </p>
        <Button onClick={handleJoin} disabled={busy} className="w-full">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join round"}
        </Button>
      </div>
    );
  }

  if (participant.hasSubmission) {
    return (
      <div className="space-y-2 rounded-sm border border-neon/40 bg-neon/5 p-4 text-sm">
        <div className="text-display text-neon">Submission received</div>
        <p className="text-muted-foreground">
          Бит улетел в судейскую. Дождись результатов раунда.
        </p>
      </div>
    );
  }

  if (!startedAt) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Готов? Нажмёшь «Старт» — начнётся таймер{" "}
          {round.timeLimitMinutes ?? "∞"} минут и откроется загрузка пака.
        </p>
        <Button onClick={handleStart} disabled={busy} className="w-full">
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Play className="h-4 w-4" /> Start timer
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "rounded-sm border p-4",
          expiredEffective
            ? "border-destructive/60 bg-destructive/10"
            : "border-neon/40 bg-neon/5",
        )}
      >
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {expiredEffective ? "Time's up" : "Time remaining"}
        </div>
        <div
          className={cn(
            "text-display text-4xl",
            expiredEffective ? "text-destructive" : "text-neon",
          )}
        >
          {expiredEffective ? "00:00" : format(remaining)}
        </div>
        {limitMs ? (
          <Progress
            className="mt-2"
            value={
              expiredEffective ? 100 : 100 - (remaining / limitMs) * 100
            }
          />
        ) : null}
      </div>

      {round.samplePackUrl ? (
        <Button asChild variant="outline" className="w-full">
          <a href={round.samplePackUrl} target="_blank" rel="noopener">
            <Download className="h-4 w-4" /> Sample pack
          </a>
        </Button>
      ) : null}

      <UploadBlock
        roundId={round.id}
        participantId={participant.id}
        disabled={expiredEffective || busy}
      />
    </div>
  );
}

function UploadBlock({
  roundId,
  participantId,
  disabled,
}: {
  roundId: string;
  participantId: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [progress, setProgress] = React.useState(0);
  const [uploading, setUploading] = React.useState(false);
  const [drag, setDrag] = React.useState(false);

  async function handleFile(file: File) {
    if (!/\.(mp3|wav)$/i.test(file.name)) {
      toast.error("Only .mp3 and .wav files allowed");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Max file size: 50 MB");
      return;
    }
    setUploading(true);
    setProgress(5);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "wav";
      const path = `${roundId}/${participantId}-${Date.now()}.${ext}`;

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not authenticated");

      const fakeProgress = setInterval(() => {
        setProgress((p) => (p < 85 ? p + 5 : p));
      }, 250);

      const { error } = await supabase.storage
        .from(BUCKETS.beats)
        .upload(path, file, {
          contentType: file.type || "audio/mpeg",
          upsert: false,
        });
      clearInterval(fakeProgress);
      if (error) throw error;
      setProgress(95);

      const duration = await readAudioDuration(file).catch(() => null);

      const res = await fetch(`/api/rounds/${roundId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          fileName: file.name,
          fileSize: file.size,
          duration,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Submit failed");
      setProgress(100);
      toast.success("Beat submitted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (disabled) return;
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed p-6 text-center transition-all",
          drag
            ? "border-neon bg-neon/5"
            : "border-border bg-secondary/30 hover:border-neon/50",
          disabled && "pointer-events-none opacity-40",
        )}
      >
        <Music2 className="mb-2 h-6 w-6 text-muted-foreground" />
        <div className="text-sm font-semibold">Drop your beat</div>
        <div className="text-xs text-muted-foreground">.mp3 or .wav · max 50MB</div>
        <input
          ref={inputRef}
          type="file"
          accept="audio/mpeg,audio/wav,.mp3,.wav"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>
      {uploading || progress > 0 ? <Progress value={progress} /> : null}
      <Button
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className="w-full"
        variant="accent"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Upload className="h-4 w-4" /> Upload beat
          </>
        )}
      </Button>
    </div>
  );
}

function readAudioDuration(file: File) {
  return new Promise<number>((resolve, reject) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    const url = URL.createObjectURL(file);
    audio.src = url;
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    };
    audio.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
  });
}
