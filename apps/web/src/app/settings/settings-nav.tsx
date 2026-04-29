"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/utils";

const settingsNavItems = [
  {
    href: "/settings/practice",
    label: "Practice",
    description: "Timer and grading defaults",
  },
  {
    href: "/settings/profile",
    label: "Profile",
    description: "Current mock user",
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:w-64">
      <nav className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-1">
        {settingsNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "rounded-xl border px-4 py-3 transition-[background-color,color,border-color]",
                isActive
                  ? "border-neutral-950 bg-neutral-950 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950",
              )}
            >
              <span className="block font-medium">{item.label}</span>
              <span
                className={cn(
                  "mt-1 block text-xs",
                  isActive ? "text-neutral-300" : "text-neutral-500",
                )}
              >
                {item.description}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}