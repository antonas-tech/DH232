import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 py-10 text-xs text-muted-foreground">
      <div className="container flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="text-display text-sm uppercase tracking-tighter text-foreground">
            DH/232 — Beat Battles
          </div>
          <div>Где сэмплы становятся битами. Закрытая лига для битмейкеров.</div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/rounds" className="hover:text-foreground">
            Rounds
          </Link>
          <Link href="/leaderboard" className="hover:text-foreground">
            Leaderboard
          </Link>
          <Link href="/hall-of-fame" className="hover:text-foreground">
            Hall of Fame
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
