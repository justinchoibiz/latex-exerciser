import Link from "next/link";

import { ProtectedRoute } from "@/features/auth";
import { AppShell } from "@/widgets/app-shell";

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppShell>
      <ProtectedRoute>
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl gap-6 px-6 py-10">
          <aside className="w-56 shrink-0">
            <p className="text-sm font-medium text-neutral-500">Settings</p>
            <nav className="mt-4 flex flex-col gap-2 text-sm">
              <Link
                href="/settings/practice"
                className="rounded-lg px-3 py-2 text-neutral-700 transition-[background-color,color] hover:bg-neutral-100 hover:text-neutral-950"
              >
                Practice
              </Link>
              <Link
                href="/settings/profile"
                className="rounded-lg px-3 py-2 text-neutral-700 transition-[background-color,color] hover:bg-neutral-100 hover:text-neutral-950"
              >
                Profile
              </Link>
            </nav>
          </aside>

          <section className="min-w-0 flex-1">{children}</section>
        </div>
      </ProtectedRoute>
    </AppShell>
  );
}