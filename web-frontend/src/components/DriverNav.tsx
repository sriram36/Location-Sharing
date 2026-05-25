"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin } from "lucide-react";

const navItems = [
  { href: "/driver/dashboard",       label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/driver/dashboard/route", label: "My Route",  icon: MapPin },
];

export default function DriverNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 mb-6">
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              active
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
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
