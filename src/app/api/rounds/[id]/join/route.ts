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
      { error: "Round is not accepting players" },
      { status: 400 },
    );
  }

  const existing = await prisma.participant.findUnique({
    where: { userId_roundId: { userId: user.id, roundId: round.id } },
  });
  if (existing) {
    return NextResponse.json({ ok: true, alreadyJoined: true });
  }

  const participant = await prisma.participant.create({
    data: {
      userId: user.id,
      roundId: round.id,
      status: "REGISTERED",
    },
  });

  return NextResponse.json({ ok: true, participantId: participant.id });
}
