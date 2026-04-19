import Link from "next/link";
import { Crown, Layers, Users } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["ADMIN"]);
  return (
    <div className="container py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <Badge variant="acid">{"// admin"}</Badge>
          <h1 className="text-display mt-2 text-3xl tracking-tighter">
            Control room
          </h1>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <nav className="space-y-1 text-sm">
            <NavItem href="/admin" icon={<Crown className="h-4 w-4" />}>
              Overview
            </NavItem>
            <NavItem
              href="/admin/rounds"
              icon={<Layers className="h-4 w-4" />}
            >
              Rounds
            </NavItem>
            <NavItem
              href="/admin/users"
              icon={<Users className="h-4 w-4" />}
            >
              Users
            </NavItem>
          </nav>
        </aside>
        <section className="col-span-12 md:col-span-9 lg:col-span-10">
          {children}
        </section>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-sm px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary hover:text-foreground"
    >
      {icon}
      {children}
    </Link>
  );
}
