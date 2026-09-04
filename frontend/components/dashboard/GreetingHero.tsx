"use client";

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  ADMIN: { label: "Admin",  cls: "bg-white/20 text-white" },
  GURU:  { label: "Guru",   cls: "bg-white/20 text-white" },
  SISWA: { label: "Siswa",  cls: "bg-white/20 text-white" },
};

function getGreeting(): { emoji: string; text: string } {
  const h = new Date().getHours();
  if (h < 5)  return { emoji: "🌙", text: "Selamat Malam" };
  if (h < 11) return { emoji: "☀️", text: "Selamat Pagi" };
  if (h < 15) return { emoji: "🌤️", text: "Selamat Siang" };
  if (h < 18) return { emoji: "🌅", text: "Selamat Sore" };
  return { emoji: "🌙", text: "Selamat Malam" };
}

function getFirstName(nama: string) {
  return nama.trim().split(/\s+/)[0] ?? nama;
}

export default function GreetingHero({
  nama,
  role,
  kelas,
}: {
  nama: string;
  role: string;
  kelas?: string;
}) {
  const { emoji, text } = getGreeting();
  const firstName   = getFirstName(nama);
  const badge       = ROLE_BADGE[role] ?? ROLE_BADGE.SISWA;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary p-6">
      <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-8 right-32 h-36 w-36 rounded-full bg-white/8" />

      <div className="relative flex items-center gap-3 sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-sm shadow-lg sm:h-14 sm:w-14 sm:text-3xl">
          {emoji}
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{text}</span>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold leading-tight text-white sm:text-2xl">{firstName}!</h1>
            <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold ${badge.cls}`}>
              {badge.label}
            </span>
            {kelas && (
              <span className="rounded-lg bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-white/80">
                {kelas}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
