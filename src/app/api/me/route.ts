import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const Body = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().or(z.literal("")).optional(),
  links: z.record(z.string(), z.string()).optional(),
});

export async function PATCH(request: Request) {
  const me = await requireUser();
  const json = await request.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }

  try {
    await prisma.user.update({
      where: { id: me.id },
      data: {
        username: parsed.data.username,
        bio: parsed.data.bio ?? null,
        avatarUrl: parsed.data.avatarUrl || null,
        links: (parsed.data.links ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 },
      );
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
