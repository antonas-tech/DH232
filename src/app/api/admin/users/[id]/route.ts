import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const Patch = z.object({
  role: z.enum(["USER", "JUDGE", "ADMIN"]).optional(),
  hallOfFame: z.boolean().optional(),
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
  await prisma.user.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}
