import { LoginForm, PublicOnlyRoute } from "@/features/auth";

export default function LoginPage() {
  return (
    <PublicOnlyRoute>
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
        <LoginForm />
      </main>
    </PublicOnlyRoute>
  );
}