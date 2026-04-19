import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata = { title: "Leaderboard — DH/232" };
export const revalidate = 30;

export default async function LeaderboardPage() {
  const users = await prisma.user
    .findMany({
      orderBy: { totalScore: "desc" },
      take: 100,
    })
    .catch(() => []);

  return (
    <div className="container py-12">
      <h1 className="text-display text-4xl tracking-tighter">Leaderboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Сезонный рейтинг по сумме средних оценок всех загруженных битов.
      </p>

      <Card className="mt-8">
        <CardContent className="divide-y divide-border/60 p-0">
          {users.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Лидерборд пуст. Будь первым.
            </div>
          ) : (
            users.map((u, i) => (
              <Link
                key={u.id}
                href={`/u/${u.username}`}
                className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-secondary/40"
              >
                <div className="flex items-center gap-4">
                  <div className="text-display w-10 text-right text-3xl text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <Avatar>
                    <AvatarImage src={u.avatarUrl ?? undefined} />
                    <AvatarFallback>
                      {u.username.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{u.username}</div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">
                      {u.role}
                    </div>
                  </div>
                </div>
                <div className="text-display text-2xl text-neon">
                  {u.totalScore.toFixed(1)}
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
