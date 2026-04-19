import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRowActions } from "./row-actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="text-display text-2xl">Users</div>
      <Card>
        <CardContent className="divide-y divide-border/60 p-0">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={u.avatarUrl ?? undefined} />
                  <AvatarFallback>{u.username.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{u.username}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
              </div>
              <UserRowActions
                id={u.id}
                role={u.role}
                hallOfFame={u.hallOfFame}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
