import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const provider = (formData.get("provider") as "github" | "google") || "github";
  const redirectTo = (formData.get("redirectTo") as string) || "/";

  const supabase = createSupabaseServerClient();
  const origin = new URL(request.url).origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(
        redirectTo,
      )}`,
    },
  });

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${error.message}`);
  }

  return NextResponse.redirect(data.url);
}
