import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const Body = z.object({
  roundId: z.string().uuid(),
  submissionId: z.string().uuid(),
  mix: z.number().min(0).max(10),
  idea: z.number().min(0).max(10),
  sample: z.number().min(0).max(10),
  vibe: z.number().min(0).max(10),
  comment: z.string().max(2000).optional().default(""),
});

export async function POST(request: Request) {
  const me = await requireRole(["JUDGE", "ADMIN"]);
  const json = await request.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }

  const submission = await prisma.submission.findUnique({
    where: { id: parsed.data.submissionId },
    include: { participant: true },
  });
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
  if (submission.participant.userId === me.id) {
    return NextResponse.json(
      { error: "You cannot score your own submission" },
      { status: 400 },
    );
  }

  const total =
    parsed.data.mix +
    parsed.data.idea +
    parsed.data.sample +
    parsed.data.vibe;

  await prisma.score.upsert({
    where: {
      submissionId_judgeId: {
        submissionId: submission.id,
        judgeId: me.id,
      },
    },
    create: {
      submissionId: submission.id,
      judgeId: me.id,
      mixScore: parsed.data.mix,
      ideaScore: parsed.data.idea,
      sampleScore: parsed.data.sample,
      vibeScore: parsed.data.vibe,
      totalPoints: total,
      comment: parsed.data.comment || null,
    },
    update: {
      mixScore: parsed.data.mix,
      ideaScore: parsed.data.idea,
      sampleScore: parsed.data.sample,
      vibeScore: parsed.data.vibe,
      totalPoints: total,
      comment: parsed.data.comment || null,
    },
  });

  // Recompute the beatmaker's lifetime total (sum of average scores per submission).
  const userId = submission.participant.userId;
  const userSubs = await prisma.submission.findMany({
    where: { participant: { userId } },
    include: { scores: true },
  });
  const totalScore = userSubs.reduce((acc, s) => {
    if (s.scores.length === 0) return acc;
    const avg =
      s.scores.reduce((a, x) => a + x.totalPoints, 0) / s.scores.length;
    return acc + avg;
  }, 0);
  await prisma.user.update({ where: { id: userId }, data: { totalScore } });

  return NextResponse.json({ ok: true });
}
