import Link from "next/link";
import { Crown } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayBeatButton } from "@/components/play-beat-button";

export const metadata = { title: "Hall of Fame — DH/232" };
export const revalidate = 60;

export default async function HallOfFamePage() {
  const [legends, topBeats] = await Promise.all([
    prisma.user.findMany({ where: { hallOfFame: true } }).catch(() => []),
    prisma.submission
      .findMany({
        include: {
          participant: { include: { user: true, round: true } },
          scores: true,
        },
      })
      .catch(() => []),
  ]);

  const ranked = topBeats
    .map((s) => {
      const total = s.scores.length
        ? s.scores.reduce((a, x) => a + x.totalPoints, 0) / s.scores.length
        : 0;
      return { s, total };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 12);

  return (
    <div className="container py-12">
      <h1 className="text-display text-4xl tracking-tighter">
        <Crown className="-mt-1 mr-2 inline h-7 w-7 text-acid" />
        Hall of Fame
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Лучшие биты прошлых батлов и легенды лиги.
      </p>

      <section className="mt-10">
        <h2 className="text-display mb-4 text-2xl">Legends</h2>
        {legends.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Зал славы пуст. Жди коронации.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {legends.map((u) => (
              <Card key={u.id}>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <Link
                      href={`/u/${u.username}`}
                      className="text-display text-lg hover:text-neon"
                    >
                      {u.username}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      Total {u.totalScore.toFixed(1)} pts
                    </div>
                  </div>
                  <Badge variant="acid">Legend</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-display mb-4 text-2xl">Greatest beats</h2>
        {ranked.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Никто ещё не загрузил легендарный бит.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {ranked.map(({ s, total }, i) => (
              <Card key={s.id}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="text-display w-8 text-right text-2xl text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/u/${s.participant.user.username}`}
                        className="block truncate font-semibold hover:text-neon"
                      >
                        {s.participant.user.username}
                      </Link>
                      <div className="truncate text-xs text-muted-foreground">
                        {s.participant.round.title}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-display text-lg text-neon">
                      {total.toFixed(1)}
                    </div>
                    <PlayBeatButton
                      track={{
                        id: s.id,
                        title: s.participant.user.username,
                        subtitle: s.participant.round.title,
                        src: s.audioUrl,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
