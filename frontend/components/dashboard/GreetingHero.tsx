"use client";

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  ADMIN: { label: "Admin",  cls: "bg-primary/10 text-primary" },
  GURU:  { label: "Guru",   cls: "bg-primary/10 text-primary" },
  SISWA: { label: "Siswa",  cls: "bg-primary/10 text-primary" },
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
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="relative flex items-center gap-3 sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl sm:h-14 sm:w-14 sm:text-3xl"
          style={{
            background: "linear-gradient(155deg, rgba(255,255,255,0.4), rgba(255,255,255,0) 55%), #D7263D",
            boxShadow: "0 5px 10px -3px #D7263D80, inset 0 2px 2px rgba(255,255,255,0.5), inset 0 -3px 4px rgba(0,0,0,0.18)",
          }}>
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{text}</span>
          <div className="flex min-w-0 flex-nowrap items-center gap-1.5 sm:flex-wrap sm:gap-2">
            <h1 className="min-w-0 truncate text-lg font-extrabold leading-tight text-slate-800 dark:text-white sm:text-2xl">{firstName}!</h1>
            <span className={`hidden shrink-0 rounded-lg px-2.5 py-0.5 text-[10px] font-bold sm:inline-block ${badge.cls}`}>
              {badge.label}
            </span>
            {kelas && (
              <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300 sm:px-2.5 sm:text-[10px]">
                {kelas}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
