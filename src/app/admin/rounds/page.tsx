import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function AdminRoundsPage() {
  const rounds = await prisma.round.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { participants: true, submissions: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-display text-2xl">Rounds</div>
        <Button asChild>
          <Link href="/admin/rounds/new">+ New round</Link>
        </Button>
      </div>
      <Card>
        <CardContent className="divide-y divide-border/60 p-0">
          {rounds.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Нет раундов. Создай первый.
            </div>
          ) : (
            rounds.map((r) => (
              <Link
                key={r.id}
                href={`/admin/rounds/${r.id}`}
                className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-secondary/40"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{r.status}</Badge>
                    <span className="text-display truncate text-lg">
                      {r.title}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <span>created {formatDate(r.createdAt)}</span>
                    <span>{r._count.participants} players</span>
                    <span>{r._count.submissions} beats</span>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Manage
                </Button>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
