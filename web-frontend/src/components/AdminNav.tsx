"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Bus, Route, ClipboardList } from "lucide-react";

const navItems = [
  { href: "/admin/dashboard",             label: "Overview",     icon: LayoutDashboard, exact: true },
  { href: "/admin/dashboard/users",       label: "Users",        icon: Users },
  { href: "/admin/dashboard/buses",       label: "Buses",        icon: Bus },
  { href: "/admin/dashboard/routes",      label: "Routes",       icon: Route },
  { href: "/admin/dashboard/assignments", label: "Assignments",  icon: ClipboardList },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 border-b pb-4 mb-8">
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
