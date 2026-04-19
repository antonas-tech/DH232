import { Gavel } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function JudgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["JUDGE", "ADMIN"]);
  return (
    <div className="container py-10">
      <div className="mb-6">
        <Badge variant="neon">
          <Gavel className="mr-1 h-3 w-3" /> judge
        </Badge>
        <h1 className="text-display mt-2 text-3xl tracking-tighter">
          Judging room
        </h1>
        <p className="text-sm text-muted-foreground">
          Биты выводятся анонимно. Оценивай только то, что слышишь.
        </p>
      </div>
      {children}
    </div>
  );
}
