import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings — DH/232" };

export default async function SettingsPage() {
  const me = await requireUser();
  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user) return null;

  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-display text-3xl tracking-tighter">Profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Настрой свой паблик-профиль.
      </p>
      <div className="mt-8">
        <SettingsForm
          user={{
            username: user.username,
            bio: user.bio ?? "",
            avatarUrl: user.avatarUrl ?? "",
            links: (user.links as Record<string, string>) ?? {},
          }}
        />
      </div>
    </div>
  );
}
