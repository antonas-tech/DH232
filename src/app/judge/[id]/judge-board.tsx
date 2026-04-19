"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { WavePlayer } from "@/components/wave-player";

type SubmissionRow = {
  id: string;
  index: number;
  audioUrl: string;
  duration: number | null;
  existingScore: {
    mix: number;
    idea: number;
    sample: number;
    vibe: number;
    comment: string;
  } | null;
};

const CRITERIA = [
  { key: "mix", label: "Mix" },
  { key: "idea", label: "Idea" },
  { key: "sample", label: "Sample work" },
  { key: "vibe", label: "Vibe" },
] as const;

type CriterionKey = (typeof CRITERIA)[number]["key"];

export function JudgeBoard({
  roundId,
  submissions,
}: {
  roundId: string;
  submissions: SubmissionRow[];
}) {
  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          В этом раунде ещё нет загруженных битов.
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      {submissions.map((s) => (
        <SubmissionCard key={s.id} roundId={roundId} sub={s} />
      ))}
    </div>
  );
}

function SubmissionCard({
  roundId,
  sub,
}: {
  roundId: string;
  sub: SubmissionRow;
}) {
  const router = useRouter();
  const [scores, setScores] = React.useState({
    mix: sub.existingScore?.mix ?? 5,
    idea: sub.existingScore?.idea ?? 5,
    sample: sub.existingScore?.sample ?? 5,
    vibe: sub.existingScore?.vibe ?? 5,
  });
  const [comment, setComment] = React.useState(sub.existingScore?.comment ?? "");
  const [busy, setBusy] = React.useState(false);

  const total = scores.mix + scores.idea + scores.sample + scores.vibe;

  function setScore(k: CriterionKey, v: number) {
    setScores((prev) => ({ ...prev, [k]: v }));
  }

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/judge/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundId,
          submissionId: sub.id,
          mix: scores.mix,
          idea: scores.idea,
          sample: scores.sample,
          vibe: scores.vibe,
          comment,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      toast.success(`Submission #${sub.index} scored`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="neon">Anonymous</Badge>
            <div className="text-display text-xl">
              Submission #{sub.index.toString().padStart(2, "0")}
            </div>
          </div>
          <div className="text-display text-xl text-neon">
            {total.toFixed(1)}
            <span className="ml-1 text-xs text-muted-foreground">/40</span>
          </div>
        </div>

        <WavePlayer src={sub.audioUrl} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {CRITERIA.map((c) => (
            <div key={c.key}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {c.label}
                </span>
                <span className="text-display text-lg">
                  {scores[c.key].toFixed(1)}
                </span>
              </div>
              <Slider
                min={0}
                max={10}
                step={0.5}
                value={[scores[c.key]]}
                onValueChange={(v) => setScore(c.key, v[0])}
              />
            </div>
          ))}
        </div>

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Feedback (optional)"
        />

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {sub.existingScore
              ? "You already scored this beat. Saving will update."
              : "Anonymous, double-blind."}
          </div>
          <Button onClick={save} disabled={busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" /> Save score
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
