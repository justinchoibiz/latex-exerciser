"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/entities/auth";

export function ProfileSummary() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div>
        <p className="text-sm font-medium text-neutral-500">Settings</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Profile information is loaded from the local mock auth session.
        </p>
      </div>

      {user && token ? (
        <div className="mt-8 grid gap-4">
          <div className="rounded-2xl border border-neutral-200 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              User ID
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-950">
              {user.id}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Email
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-950">
              {user.email}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Display name
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-950">
              {user.displayName}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Login is required to view profile data.
        </div>
      )}
    </section>
  );
}