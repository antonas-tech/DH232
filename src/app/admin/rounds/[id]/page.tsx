import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { RoundForm } from "../round-form";
import { DeleteRoundButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function AdminEditRoundPage({
  params,
}: {
  params: { id: string };
}) {
  const round = await prisma.round.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { participants: true, submissions: true } },
    },
  });
  if (!round) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <Link
            href="/admin/rounds"
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            ← Back
          </Link>
          <h2 className="text-display mt-2 text-2xl">{round.title}</h2>
          <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            {round._count.participants} players · {round._count.submissions}{" "}
            beats
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/rounds/${round.id}`}>View public</Link>
          </Button>
          <DeleteRoundButton id={round.id} />
        </div>
      </div>

      <RoundForm
        round={{
          id: round.id,
          title: round.title,
          description: round.description,
          coverUrl: round.coverUrl,
          samplePackUrl: round.samplePackUrl,
          samplePackPath: round.samplePackPath,
          status: round.status,
          rules: (round.rules as { bpm?: string; genre?: string; notes?: string } | null) ?? null,
          prizePool: round.prizePool,
          startDate: round.startDate ? round.startDate.toISOString() : null,
          endDate: round.endDate ? round.endDate.toISOString() : null,
          timeLimitMinutes: round.timeLimitMinutes,
        }}
      />
    </div>
  );
}
