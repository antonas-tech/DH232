import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const Body = z.object({
  title: z.string().min(2),
  description: z.string().nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  samplePackUrl: z.string().url().nullable().optional(),
  samplePackPath: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "REGISTRATION", "ACTIVE", "JUDGING", "FINISHED"]),
  rules: z
    .object({
      bpm: z.string().optional(),
      genre: z.string().optional(),
      notes: z.string().optional(),
    })
    .nullable()
    .optional(),
  prizePool: z.string().nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  timeLimitMinutes: z.number().int().nonnegative().nullable().optional(),
});

export async function POST(request: Request) {
  await requireRole(["ADMIN"]);
  const json = await request.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }
  const round = await prisma.round.create({
    data: {
      ...parsed.data,
      rules: parsed.data.rules ?? undefined,
    },
  });
  return NextResponse.json({ id: round.id });
}
