import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const Patch = z.object({
  title: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  samplePackUrl: z.string().url().nullable().optional(),
  samplePackPath: z.string().nullable().optional(),
  status: z
    .enum(["DRAFT", "REGISTRATION", "ACTIVE", "JUDGING", "FINISHED"])
    .optional(),
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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  await requireRole(["ADMIN"]);
  const json = await request.json();
  const parsed = Patch.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }
  const round = await prisma.round.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      rules: parsed.data.rules ?? undefined,
    },
  });
  return NextResponse.json({ id: round.id });
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  await requireRole(["ADMIN"]);
  await prisma.round.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
