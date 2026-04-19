import Link from "next/link";
import { Crown, Gavel, Headphones, LogOut, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import { signOutAction } from "@/app/actions/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-neon text-neon-foreground">
              <Headphones className="h-4 w-4" />
            </div>
            <span className="text-display text-lg leading-none tracking-tighter">
              DH<span className="text-neon">/</span>232
            </span>
            <Badge variant="outline" className="hidden md:inline-flex">
              Beat Battles
            </Badge>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="/rounds">Rounds</NavLink>
            <NavLink href="/leaderboard">Leaderboard</NavLink>
            <NavLink href="/hall-of-fame">Hall of Fame</NavLink>
            {user?.role === "JUDGE" || user?.role === "ADMIN" ? (
              <NavLink href="/judge">
                <Gavel className="mr-1 h-3.5 w-3.5" /> Judge
              </NavLink>
            ) : null}
            {user?.role === "ADMIN" ? (
              <NavLink href="/admin">
                <Shield className="mr-1 h-3.5 w-3.5" /> Admin
              </NavLink>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-2 py-1 text-left transition hover:border-neon/50">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.avatarUrl ?? undefined} />
                    <AvatarFallback>
                      {user.username.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-xs sm:block">
                    <div className="font-semibold leading-none">
                      {user.username}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {user.role}
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/u/${user.username}`}>
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Crown className="mr-2 h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center px-3 py-1.5 text-sm hover:bg-secondary"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/login">Enter battle</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-sm px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {children}
    </Link>
  );
}
