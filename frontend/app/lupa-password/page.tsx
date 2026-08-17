import { LupaPasswordCard } from "./LupaPasswordCard";

export default function LupaPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#EDF2F4] px-4 py-12 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(244,72,92,0.045) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <LupaPasswordCard />
    </main>
  );
}
