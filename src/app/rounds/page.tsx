import { prisma } from "@/lib/prisma";
import { RoundCard } from "@/components/round-card";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Rounds — DH/232" };
export const revalidate = 30;

export default async function RoundsPage() {
  const rounds = await prisma.round
    .findMany({
      where: { status: { not: "DRAFT" } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { _count: { select: { participants: true } } },
    })
    .catch(() => []);

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-display text-4xl tracking-tighter">All rounds</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Открытые батлы, активные раунды и ещё не закрытое судейство.
        </p>
      </div>

      {rounds.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            Нет активных раундов. Загляни позже.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rounds.map((round) => (
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
    </div>
  );
}
