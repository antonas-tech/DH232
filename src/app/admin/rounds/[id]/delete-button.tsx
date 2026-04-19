"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteRoundButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function handleDelete() {
    if (!confirm("Delete this round? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/rounds/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      toast.success("Round deleted");
      router.push("/admin/rounds");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="destructive" disabled={busy} onClick={handleDelete}>
      <Trash2 className="h-4 w-4" /> Delete
    </Button>
  );
}
