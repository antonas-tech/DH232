import Link from "next/link";
import { Calendar, Timer, Users } from "lucide-react";
import type { Round } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const STATUS_VARIANT: Record<
  Round["status"],
  "neon" | "acid" | "outline" | "default" | "destructive"
> = {
  DRAFT: "outline",
  REGISTRATION: "neon",
  ACTIVE: "acid",
  JUDGING: "default",
  FINISHED: "outline",
};

const STATUS_LABEL: Record<Round["status"], string> = {
  DRAFT: "Draft",
  REGISTRATION: "Open",
  ACTIVE: "Live",
  JUDGING: "Judging",
  FINISHED: "Finished",
};

export function RoundCard({
  round,
}: {
  round: Round & { participantsCount?: number };
}) {
  return (
    <Link href={`/rounds/${round.id}`}>
      <Card className="group overflow-hidden transition-all hover:border-neon/50 hover:shadow-[0_0_24px_-6px_hsl(var(--neon)/0.4)]">
        <div
          className="relative h-32 w-full overflow-hidden border-b border-border bg-secondary/50"
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
          {!round.coverUrl ? (
            <div className="grid-bg h-full w-full" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          <div className="absolute left-3 top-3">
            <Badge variant={STATUS_VARIANT[round.status]}>
              {STATUS_LABEL[round.status]}
            </Badge>
          </div>
        </div>
        <CardContent className="space-y-3 p-5">
          <div>
            <div className="text-display text-xl tracking-tight">
              {round.title}
            </div>
            {round.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {round.description}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            {round.timeLimitMinutes ? (
              <span className="inline-flex items-center gap-1">
                <Timer className="h-3 w-3" /> {round.timeLimitMinutes}m
              </span>
            ) : null}
            {round.endDate ? (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {formatDate(round.endDate)}
              </span>
            ) : null}
            {typeof round.participantsCount === "number" ? (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" /> {round.participantsCount}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
