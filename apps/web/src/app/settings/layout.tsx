import { ProtectedRoute } from "@/features/auth";
import { AppShell } from "@/widgets/app-shell";

import { SettingsNav } from "./settings-nav";

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppShell>
      <ProtectedRoute>
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:flex-row">
          <SettingsNav />

          <section className="min-w-0 flex-1">{children}</section>
        </div>
      </ProtectedRoute>
    </AppShell>
  );
}