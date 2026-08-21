import { LengkapiProfilCard } from "./LengkapiProfilCard";

export default function LengkapiProfilPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FF5722] px-4 py-12 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,91,25,0.045) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <LengkapiProfilCard />
    </main>
  );
}
