import Link from "next/link";
import { redirect } from "next/navigation";
import { Github, Chrome, Mail } from "lucide-react";

import { LoginForm } from "./login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Sign in — DH/232" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  const user = await getCurrentUser();
  if (user) redirect(searchParams.redirect ?? "/");

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-12">
      <div className="grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="hidden flex-col justify-between rounded-md border border-border/60 bg-card/40 p-8 lg:flex">
          <div>
            <Badge variant="neon">{"// access required"}</Badge>
            <h1 className="text-display mt-4 text-4xl leading-tight tracking-tighter">
              Войди в кабину.
              <br />
              Сэмплы ждут.
            </h1>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Закрытая лига битмейкеров. Скачивай пак, включай таймер,
              отправляй бит. Анонимная судейская оценка по 4 критериям —
              скорость, идея, работа с сэмплом, вайб.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <Stat label="Beats" value="∞" />
            <Stat label="Judges" value="04" />
            <Stat label="Vibe" value="MAX" />
          </div>
        </div>

        <Card className="border-neon/20">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <p className="text-sm text-muted-foreground">
              Email magic link or OAuth. New users are auto-provisioned.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <LoginForm redirectTo={searchParams.redirect ?? "/"} />
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <OAuthButton
                provider="github"
                icon={<Github className="h-4 w-4" />}
                label="Continue with GitHub"
                redirectTo={searchParams.redirect ?? "/"}
              />
              <OAuthButton
                provider="google"
                icon={<Chrome className="h-4 w-4" />}
                label="Continue with Google"
                redirectTo={searchParams.redirect ?? "/"}
              />
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              By continuing you agree to the house rules. Be original.
            </p>
            <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                ← back to home
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-secondary/30 p-3">
      <div className="text-display text-2xl text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function OAuthButton({
  provider,
  icon,
  label,
  redirectTo,
}: {
  provider: "github" | "google";
  icon: React.ReactNode;
  label: string;
  redirectTo: string;
}) {
  return (
    <form action="/api/auth/oauth" method="POST">
      <input type="hidden" name="provider" value={provider} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <button
        type="submit"
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-border bg-secondary/30 px-4 text-sm font-semibold uppercase tracking-widest hover:border-neon/50"
      >
        {icon}
        {label}
      </button>
    </form>
  );
}
