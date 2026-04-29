"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/entities/auth";
import { cn } from "@/shared/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
};

const navigationItems = [
  {
    href: "/quiz/setup",
    label: "Quiz Setup",
  },
  {
    href: "/settings/practice",
    label: "Settings",
  },
  {
    href: "/quizzes",
    label: "Quiz Data",
  },
];

function getRouteLabel(pathname: string) {
  if (pathname.startsWith("/quiz/play")) {
    return "Quiz Play";
  }

  if (pathname.startsWith("/quiz/result")) {
    return "Quiz Result";
  }

  if (pathname.startsWith("/quiz/setup")) {
    return "Quiz Setup";
  }

  if (pathname.startsWith("/settings")) {
    return "Settings";
  }

  if (pathname.startsWith("/quizzes")) {
    return "Quiz Data";
  }

  return "LaTeX Exerciser";
}

function isActiveNavItem(pathname: string, href: string) {
  if (href === "/quiz/setup") {
    return pathname.startsWith("/quiz");
  }

  if (href === "/settings/practice") {
    return pathname.startsWith("/settings");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hydrate = useAuthStore((state) => state.hydrate);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const routeLabel = getRouteLabel(pathname);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex min-w-0 items-center gap-8">
            <Link
              href="/quiz/setup"
              className="shrink-0 text-sm font-semibold tracking-tight text-neutral-950"
            >
              LaTeX Exerciser
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {navigationItems.map((item) => {
                const isActive = isActiveNavItem(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition-[background-color,color]",
                      isActive
                        ? "bg-neutral-950 text-white"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                {routeLabel}
              </p>
              <p className="max-w-48 truncate text-sm text-neutral-700">
                {user ? user.displayName : "Not signed in"}
              </p>
            </div>

            {token ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-[background-color,color,border-color] hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-950"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-[background-color,color,border-color] hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-950"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-neutral-100 px-4 py-2 md:hidden">
          {navigationItems.map((item) => {
            const isActive = isActiveNavItem(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-[background-color,color]",
                  isActive
                    ? "bg-neutral-950 text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}