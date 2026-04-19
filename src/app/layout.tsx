import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GlobalPlayer } from "@/components/global-player";

import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DH/232 — Beat Battles",
  description:
    "Закрытая соревновательная платформа для битмейкеров. Sample packs, strict timers, blind judging.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${sans.variable} ${mono.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen pb-28">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <GlobalPlayer />
        <Toaster
          richColors
          theme="dark"
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast:
                "border border-border bg-card text-foreground rounded-sm",
            },
          }}
        />
      </body>
    </html>
  );
}
