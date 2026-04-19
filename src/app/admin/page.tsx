import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminOverviewPage() {
  const [rounds, users, submissions] = await Promise.all([
    prisma.round.count(),
    prisma.user.count(),
    prisma.submission.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Stat label="Rounds" value={rounds} />
        <Stat label="Users" value={users} />
        <Stat label="Beats" value={submissions} />
      </div>
      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="text-display text-lg">Quick actions</div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/admin/rounds/new">Create round</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/rounds">Manage rounds</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/users">Manage users</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
        <div className="text-display mt-1 text-4xl text-neon">{value}</div>
      </CardContent>
    </Card>
  );
}
