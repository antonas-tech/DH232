import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  _: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const round = await prisma.round.findUnique({ where: { id: params.id } });
  if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

  if (!["REGISTRATION", "ACTIVE"].includes(round.status)) {
    return NextResponse.json(
      { error: "Round is not active" },
      { status: 400 },
    );
  }

  const participant = await prisma.participant.findUnique({
    where: { userId_roundId: { userId: user.id, roundId: round.id } },
  });
  if (!participant) {
    return NextResponse.json(
      { error: "Join the round first" },
      { status: 400 },
    );
  }

  if (participant.startedAt) {
    return NextResponse.json({ ok: true, alreadyStarted: true });
  }

  const updated = await prisma.participant.update({
    where: { id: participant.id },
    data: {
      startedAt: new Date(),
      status: "IN_PROGRESS",
    },
  });

  return NextResponse.json({
    ok: true,
    startedAt: updated.startedAt,
  });
}
