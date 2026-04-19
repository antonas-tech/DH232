import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Crown,
  Download,
  Music2,
  Trophy,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { RoundParticipateBlock } from "./participate-block";

export const dynamic = "force-dynamic";

export default async function RoundPage({
  params,
}: {
  params: { id: string };
}) {
  const round = await prisma.round.findUnique({
    where: { id: params.id },
    include: {
      participants: {
        include: { user: true, submission: { include: { scores: true } } },
      },
    },
  });
  if (!round) notFound();

  const user = await getCurrentUser();
  const me = round.participants.find((p) => p.userId === user?.id);

  const submitted = round.participants.filter((p) => p.submission).length;
  const winners = round.participants
    .filter((p) => p.submission)
    .map((p) => {
      const total = p.submission!.scores.reduce(
        (acc, s) => acc + s.totalPoints,
        0,
      );
      return { participant: p, total };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  const rules = (round.rules ?? {}) as {
    bpm?: string;
    genre?: string;
    notes?: string;
  };

  return (
    <div className="container py-12">
      <Link
        href="/rounds"
        className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        ← Back to rounds
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div
            className="relative h-56 w-full overflow-hidden rounded-md border border-border bg-secondary"
            style={
              round.coverUrl
                ? {
                    backgroundImage: `url(${round.coverUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {!round.coverUrl ? <div className="grid-bg h-full w-full" /> : null}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
              <div>
                <Badge variant="neon">{round.status}</Badge>
                <h1 className="text-display mt-2 text-4xl tracking-tighter">
                  {round.title}
                </h1>
              </div>
              {round.prizePool ? (
                <Badge variant="acid">
                  <Trophy className="mr-1 h-3 w-3" /> {round.prizePool}
                </Badge>
              ) : null}
            </div>
          </div>

          {round.description ? (
            <p className="mt-6 max-w-prose text-sm text-muted-foreground">
              {round.description}
            </p>
          ) : null}

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat
              icon={<Users className="h-4 w-4" />}
              label="Players"
              value={round.participants.length.toString()}
            />
            <Stat
              icon={<Music2 className="h-4 w-4" />}
              label="Submitted"
              value={submitted.toString()}
            />
            <Stat
              icon={<Calendar className="h-4 w-4" />}
              label="Ends"
              value={round.endDate ? formatDate(round.endDate) : "—"}
            />
            <Stat
              icon={<Trophy className="h-4 w-4" />}
              label="Time limit"
              value={
                round.timeLimitMinutes
                  ? `${round.timeLimitMinutes} min`
                  : "Open"
              }
            />
          </div>

          {(rules.bpm || rules.genre || rules.notes) && (
            <Card className="mt-6">
              <CardContent className="space-y-3 p-5">
                <div className="text-display text-sm uppercase tracking-widest">
                  Rules
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                  {rules.bpm ? (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        BPM
                      </div>
                      <div className="text-display text-2xl">{rules.bpm}</div>
                    </div>
                  ) : null}
                  {rules.genre ? (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Genre
                      </div>
                      <div className="text-display text-lg">{rules.genre}</div>
                    </div>
                  ) : null}
                  {rules.notes ? (
                    <div className="md:col-span-3">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Notes
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {rules.notes}
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )}

          {winners.length > 0 && round.status === "FINISHED" ? (
            <Card className="mt-6">
              <CardContent className="space-y-3 p-5">
                <div className="text-display flex items-center text-sm uppercase tracking-widest">
                  <Crown className="mr-2 h-4 w-4 text-acid" /> Winners
                </div>
                <div className="space-y-2">
                  {winners.map((w, i) => (
                    <div
                      key={w.participant.id}
                      className="flex items-center justify-between rounded-sm border border-border bg-secondary/40 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-display w-6 text-2xl text-muted-foreground">
                          {i + 1}
                        </div>
                        <Link
                          href={`/u/${w.participant.user.username}`}
                          className="font-semibold hover:text-neon"
                        >
                          {w.participant.user.username}
                        </Link>
                      </div>
                      <div className="text-display text-lg text-neon">
                        {w.total.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="text-display text-sm uppercase tracking-widest">
                Participate
              </div>
              {!user ? (
                <Button asChild className="w-full">
                  <Link href={`/login?redirect=/rounds/${round.id}`}>
                    Sign in to compete
                  </Link>
                </Button>
              ) : round.status !== "ACTIVE" &&
                round.status !== "REGISTRATION" ? (
                <p className="text-sm text-muted-foreground">
                  Round is {round.status.toLowerCase()}.
                </p>
              ) : (
                <RoundParticipateBlock
                  round={{
                    id: round.id,
                    timeLimitMinutes: round.timeLimitMinutes,
                    samplePackUrl: round.samplePackUrl,
                  }}
                  participant={
                    me
                      ? {
                          id: me.id,
                          status: me.status,
                          startedAt: me.startedAt
                            ? me.startedAt.toISOString()
                            : null,
                          hasSubmission: Boolean(me.submission),
                        }
                      : null
                  }
                />
              )}
            </CardContent>
          </Card>

          {round.samplePackUrl && me ? (
            <Card>
              <CardContent className="space-y-3 p-5">
                <div className="text-display text-sm uppercase tracking-widest">
                  Sample pack
                </div>
                <Button asChild variant="outline" className="w-full">
                  <a href={round.samplePackUrl} target="_blank" rel="noopener">
                    <Download className="h-4 w-4" /> Download
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardContent className="space-y-2 p-5">
              <div className="text-display text-sm uppercase tracking-widest">
                Roster
              </div>
              <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                {round.participants.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No players yet — be first.
                  </div>
                ) : (
                  round.participants.map((p) => (
                    <Link
                      href={`/u/${p.user.username}`}
                      key={p.id}
                      className="flex items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-secondary/40"
                    >
                      <span>{p.user.username}</span>
                      <Badge
                        variant={
                          p.submission
                            ? "neon"
                            : p.status === "EXPIRED"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {p.submission ? "Submitted" : p.status}
                      </Badge>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-[10px] uppercase tracking-widest">
            {label}
          </span>
        </div>
        <div className="text-display mt-1 text-xl">{value}</div>
      </CardContent>
    </Card>
  );
}
