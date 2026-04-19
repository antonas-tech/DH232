import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="text-display text-7xl tracking-tighter text-neon">404</div>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Этого трека нет в плейлисте.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
