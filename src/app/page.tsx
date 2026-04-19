import Link from "next/link";
import { ArrowRight, Crown, Gavel, Headphones, Timer } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { RoundCard } from "@/components/round-card";

export const revalidate = 30;

export default async function HomePage() {
  const [activeRounds, top, hallOfFame] = await Promise.all([
    prisma.round.findMany({
      where: { status: { in: ["REGISTRATION", "ACTIVE", "JUDGING"] } },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { _count: { select: { participants: true } } },
    }),
    prisma.user.findMany({
      orderBy: { totalScore: "desc" },
      take: 5,
    }),
    prisma.user.findMany({
      where: { hallOfFame: true },
      take: 3,
    }),
  ]).catch(() => [[], [], []] as const);

  return (
    <>
      <section className="grid-bg border-b border-border/60">
        <div className="container py-20 md:py-28">
          <Badge variant="neon" className="animate-pulseNeon">
            {"// Season 02 — open"}
          </Badge>
          <h1 className="text-display mt-6 max-w-4xl text-5xl leading-[0.95] tracking-tighter md:text-7xl">
            Where samples become{" "}
            <span className="text-neon">beats</span>.<br />
            On the clock.
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground">
            Замкнутая лига для битмейкеров. Скачивай sample pack, включай
            таймер, отправляй бит. Анонимная судейская оценка по 4 критериям.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/rounds">
                Browse rounds <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/leaderboard">Leaderboard</Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Feature
              icon={<Timer className="h-4 w-4" />}
              title="Strict Timers"
              text="Таймер запускается в момент скачивания пака. Не успел — форма блокируется."
            />
            <Feature
              icon={<Gavel className="h-4 w-4" />}
              title="Blind Judging"
              text="Биты выводятся анонимно: Submission #N. Никаких имён, никакой предвзятости."
            />
            <Feature
              icon={<Headphones className="h-4 w-4" />}
              title="DAW-grade UI"
              text="Сэквенсорный темно-неоновый интерфейс, вейвформы, глобальный плеер."
            />
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-display text-3xl tracking-tighter">
            Live rounds
          </h2>
          <Link
            href="/rounds"
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            All rounds →
          </Link>
        </div>
        {activeRounds.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              Раундов пока нет. Админ скоро создаст первый батл.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeRounds.map((round) => (
              <RoundCard
                key={round.id}
                round={{
                  ...round,
                  participantsCount: round._count.participants,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="container grid grid-cols-1 gap-6 py-16 md:grid-cols-2">
        <div>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-display text-2xl tracking-tighter">
              Top beatmakers
            </h2>
            <Link
              href="/leaderboard"
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Full chart →
            </Link>
          </div>
          <Card>
            <CardContent className="divide-y divide-border/60 p-0">
              {top.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">
                  Ещё нет побед. Будь первым.
                </div>
              ) : (
                top.map((user, i) => (
                  <Link
                    href={`/u/${user.username}`}
                    key={user.id}
                    className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-secondary/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-display w-8 text-right text-2xl text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <div className="font-semibold">{user.username}</div>
                        <div className="text-xs text-muted-foreground">
                          since {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="text-display text-xl text-neon">
                      {user.totalScore.toFixed(1)}
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-display text-2xl tracking-tighter">
              <Crown className="-mt-1 mr-1 inline h-5 w-5 text-acid" /> Hall
              of Fame
            </h2>
            <Link
              href="/hall-of-fame"
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {hallOfFame.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Зал славы пуст. Первая глава ещё не написана.
                </CardContent>
              </Card>
            ) : (
              hallOfFame.map((u) => (
                <Card key={u.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <div className="text-display text-lg">{u.username}</div>
                      <div className="text-xs text-muted-foreground">
                        Total {u.totalScore.toFixed(1)} pts
                      </div>
                    </div>
                    <Badge variant="acid">Legend</Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center gap-2 text-neon">
          {icon}
          <span className="text-xs font-bold uppercase tracking-widest">
            {title}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}
