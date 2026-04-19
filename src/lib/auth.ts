import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  role: Role;
  totalScore: number;
};

/**
 * Returns the currently signed-in user merged with their profile row.
 * Lazily provisions a profile row on first access.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let profile = await prisma.user.findUnique({ where: { id: user.id } });

  if (!profile) {
    const fallbackUsername =
      (user.user_metadata?.user_name as string | undefined) ||
      (user.user_metadata?.preferred_username as string | undefined) ||
      (user.email ? user.email.split("@")[0] : "user") +
        "-" +
        user.id.slice(0, 6);

    profile = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email ?? `${user.id}@unknown.local`,
        username: fallbackUsername,
        avatarUrl:
          (user.user_metadata?.avatar_url as string | undefined) ?? null,
      },
    });
  }

  return {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
    totalScore: profile.totalScore,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/");
  return user;
}
