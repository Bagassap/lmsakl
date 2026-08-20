import { LoginCard } from "./LoginCard";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FBF4E6] px-4 py-12 sm:px-6">
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,91,25,0.16), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(185,28,28,0.14), transparent 70%)" }}
      />

      <LoginCard />
    </main>
  );
}
