import { LengkapiFotoProfilCard } from "./LengkapiFotoProfilCard";

export default function LengkapiFotoProfilPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#EA580C] px-4 py-12 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(234,88,12,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <LengkapiFotoProfilCard />
    </main>
  );
}
