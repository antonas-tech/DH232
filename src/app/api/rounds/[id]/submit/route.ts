import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BUCKETS, publicUrl } from "@/lib/storage";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const Body = z.object({
  path: z.string().min(1),
  fileName: z.string().optional(),
  fileSize: z.number().int().nonnegative().optional(),
  duration: z.number().nullable().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }

  const round = await prisma.round.findUnique({ where: { id: params.id } });
  if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

  if (!["REGISTRATION", "ACTIVE"].includes(round.status)) {
    return NextResponse.json(
      { error: "Round is closed for uploads" },
      { status: 400 },
    );
  }

  const participant = await prisma.participant.findUnique({
    where: { userId_roundId: { userId: user.id, roundId: round.id } },
    include: { submission: true },
  });
  if (!participant) {
    return NextResponse.json(
      { error: "Join the round first" },
      { status: 400 },
    );
  }
  if (participant.submission) {
    return NextResponse.json(
      { error: "You already submitted a beat" },
      { status: 400 },
    );
  }
  if (!participant.startedAt) {
    return NextResponse.json(
      { error: "Start the timer first" },
      { status: 400 },
    );
  }

  if (round.timeLimitMinutes) {
    const elapsedMin =
      (Date.now() - new Date(participant.startedAt).getTime()) / 60_000;
    if (elapsedMin > round.timeLimitMinutes + 0.25) {
      await prisma.participant.update({
        where: { id: participant.id },
        data: { status: "EXPIRED" },
      });
      // Best-effort cleanup of the orphaned upload.
      try {
        const admin = createSupabaseAdminClient();
        await admin.storage.from(BUCKETS.beats).remove([parsed.data.path]);
      } catch {
        /* ignore */
      }
      return NextResponse.json(
        { error: "Time limit exceeded" },
        { status: 400 },
      );
    }
  }

  const audioUrl = publicUrl(BUCKETS.beats, parsed.data.path);

  const submission = await prisma.submission.create({
    data: {
      participantId: participant.id,
      roundId: round.id,
      audioUrl,
      audioPath: parsed.data.path,
      fileName: parsed.data.fileName,
      fileSize: parsed.data.fileSize,
      duration: parsed.data.duration ?? null,
    },
  });

  await prisma.participant.update({
    where: { id: participant.id },
    data: { status: "SUBMITTED" },
  });

  return NextResponse.json({ ok: true, submissionId: submission.id });
}
