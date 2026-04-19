import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { JudgeBoard } from "./judge-board";

export const dynamic = "force-dynamic";

export default async function JudgeRoundPage({
  params,
}: {
  params: { id: string };
}) {
  const me = await requireRole(["JUDGE", "ADMIN"]);

  const round = await prisma.round.findUnique({
    where: { id: params.id },
    include: {
      submissions: {
        include: {
          scores: { where: { judgeId: me.id } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!round) notFound();

  return (
    <div>
      <Link
        href="/judge"
        className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        ← Back
      </Link>
      <div className="mt-2 mb-6">
        <h2 className="text-display text-2xl">{round.title}</h2>
      </div>
      <JudgeBoard
        roundId={round.id}
        submissions={round.submissions.map((s, i) => ({
          id: s.id,
          index: i + 1,
          audioUrl: s.audioUrl,
          duration: s.duration ?? null,
          existingScore: s.scores[0]
            ? {
                mix: s.scores[0].mixScore,
                idea: s.scores[0].ideaScore,
                sample: s.scores[0].sampleScore,
                vibe: s.scores[0].vibeScore,
                comment: s.scores[0].comment ?? "",
              }
            : null,
        }))}
      />
    </div>
  );
}
