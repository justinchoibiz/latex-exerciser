import { PublicOnlyRoute, SignupForm } from "@/features/auth";

export default function SignupPage() {
  return (
    <PublicOnlyRoute>
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
        <SignupForm />
      </main>
    </PublicOnlyRoute>
  );
}