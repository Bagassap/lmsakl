import { LoginCard } from "./LoginCard";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-[100dvh] items-end justify-center overflow-hidden bg-[#D7263D] sm:items-center sm:bg-[#FAFAED] sm:px-6 sm:py-12">
      <div
        className="pointer-events-none absolute -left-32 -top-32 hidden h-96 w-96 rounded-full blur-3xl sm:block"
        style={{ background: "radial-gradient(circle, rgba(215,38,61,0.16), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-24 hidden h-96 w-96 rounded-full blur-3xl sm:block"
        style={{ background: "radial-gradient(circle, rgba(185,28,28,0.14), transparent 70%)" }}
      />

      <LoginCard />
    </main>
  );
}
