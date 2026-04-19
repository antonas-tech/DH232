"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Role } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLES: Role[] = ["USER", "JUDGE", "ADMIN"];

export function UserRowActions({
  id,
  role,
  hallOfFame,
}: {
  id: string;
  role: Role;
  hallOfFame: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function update(payload: Partial<{ role: Role; hallOfFame: boolean }>) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      toast.success("User updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        defaultValue={role}
        onValueChange={(v) => update({ role: v as Role })}
        disabled={busy}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant={hallOfFame ? "accent" : "outline"}
        disabled={busy}
        onClick={() => update({ hallOfFame: !hallOfFame })}
      >
        {hallOfFame ? "★ Legend" : "Add to HoF"}
      </Button>
    </div>
  );
}
