import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function JudgeIndexPage() {
  const rounds = await prisma.round.findMany({
    where: { status: { in: ["JUDGING", "ACTIVE", "FINISHED"] } },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <div className="space-y-3">
      {rounds.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Нет раундов на оценке.
          </CardContent>
        </Card>
      ) : (
        rounds.map((r) => (
          <Link key={r.id} href={`/judge/${r.id}`}>
            <Card className="transition-all hover:border-neon/50">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <Badge variant="outline">{r.status}</Badge>
                  <div className="text-display mt-1 text-lg">{r.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {r._count.submissions} submissions
                  </div>
                </div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Open →
                </div>
              </CardContent>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
