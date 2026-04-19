import { notFound } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlayBeatButton } from "@/components/play-beat-button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      participants: {
        include: {
          round: true,
          submission: { include: { scores: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!user) notFound();

  const submissions = user.participants
    .filter((p) => p.submission)
    .map((p) => p.submission!);
  const wins = user.participants.filter((p) => {
    if (!p.submission || p.round.status !== "FINISHED") return false;
    return p.submission.scores.length > 0;
  }).length;
  const avg =
    submissions.length === 0
      ? 0
      : submissions
          .filter((s) => s.scores.length)
          .reduce((acc, s) => {
            const a =
              s.scores.reduce((aa, x) => aa + x.totalPoints, 0) /
              s.scores.length;
            return acc + a;
          }, 0) / Math.max(1, submissions.filter((s) => s.scores.length).length);

  const links = (user.links as Record<string, string> | null) ?? {};

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="space-y-4 p-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback>{user.username.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-display text-2xl">{user.username}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {user.role} · since {formatDate(user.createdAt)}
                </div>
              </div>
              {user.bio ? (
                <p className="text-sm text-muted-foreground">{user.bio}</p>
              ) : null}
              {Object.keys(links).length ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(links).map(([k, v]) =>
                    v ? (
                      <a
                        key={k}
                        href={v}
                        target="_blank"
                        rel="noopener"
                        className="rounded-sm border border-border px-2 py-1 text-[10px] uppercase tracking-widest hover:border-neon/50"
                      >
                        {k}
                      </a>
                    ) : null,
                  )}
                </div>
              ) : null}
              <div className="grid grid-cols-3 gap-3 pt-3">
                <Stat label="Total" value={user.totalScore.toFixed(1)} />
                <Stat label="Beats" value={submissions.length} />
                <Stat label="Avg" value={avg.toFixed(1)} />
              </div>
              {user.hallOfFame ? <Badge variant="acid">Legend</Badge> : null}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-display mb-4 text-2xl">History</h2>
          <div className="space-y-3">
            {user.participants.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Ещё не было выходов на сцену.
                </CardContent>
              </Card>
            ) : (
              user.participants.map((p) => (
                <Card key={p.id}>
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <Link
                        href={`/rounds/${p.round.id}`}
                        className="text-display block truncate text-lg hover:text-neon"
                      >
                        {p.round.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                        <Badge variant="outline">{p.round.status}</Badge>
                        <span>{formatDate(p.createdAt)}</span>
                        {p.submission && p.submission.scores.length > 0 ? (
                          <span>
                            avg{" "}
                            {(
                              p.submission.scores.reduce(
                                (a, x) => a + x.totalPoints,
                                0,
                              ) / p.submission.scores.length
                            ).toFixed(1)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {p.submission ? (
                      <PlayBeatButton
                        track={{
                          id: p.submission.id,
                          title: user.username,
                          subtitle: p.round.title,
                          src: p.submission.audioUrl,
                        }}
                      />
                    ) : (
                      <Badge variant="outline">{p.status}</Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          {/* avoid unused warning */}
          <span className="hidden">{wins}</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-sm border border-border bg-secondary/30 p-3 text-center">
      <div className="text-display text-xl text-neon">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
