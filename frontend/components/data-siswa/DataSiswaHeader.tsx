"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Users } from "lucide-react";

export type HeaderStat = { icon: React.ComponentType<{ size?: number; className?: string }>; label: string };

function Banner({ title, eyebrow, className = "" }: { title: string; eyebrow: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}>
      <div className="relative flex items-center gap-3 sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:h-14 sm:w-14" style={{ background: "linear-gradient(155deg, rgba(255,255,255,0.4), rgba(255,255,255,0) 55%), #D7263D", boxShadow: "0 5px 10px -3px #D7263D80, inset 0 2px 2px rgba(255,255,255,0.5), inset 0 -3px 4px rgba(0,0,0,0.18)" }}>
          <Users size={22} className="text-white sm:hidden" />
          <Users size={26} className="hidden text-white sm:block" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{eyebrow}</span>
          <h1 className="text-xl font-extrabold leading-tight text-slate-800 dark:text-white sm:text-2xl">{title}</h1>
        </div>
      </div>
    </div>
  );
}

export function DataSiswaHeader({
  title,
  eyebrow = "Data Siswa",
}: {
  title: string;
  eyebrow?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isGuru = pathname?.startsWith("/guru/") ?? false;
  const isAdmin = pathname?.startsWith("/admin/") ?? false;

  if (!isGuru && !isAdmin) return <Banner title={title} eyebrow={eyebrow} />;

  const dashboardHref = isGuru ? "/guru/dashboard" : "/admin/dashboard";

  return (
    <>
      <Banner title={title} eyebrow={eyebrow} className="hidden lg:block" />
      <div className="relative -mx-4 -mt-4 bg-primary lg:hidden">
        <div className="relative flex items-center px-4 pb-3 pt-4">
          <button type="button" onClick={() => router.push(dashboardHref)}
            className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white active:bg-white/25">
            <ChevronLeft size={18} />
          </button>
          <h1 className="absolute inset-x-0 text-center text-base font-bold text-white">{title}</h1>
        </div>
        <div className="h-7 rounded-t-[28px] bg-surface dark:bg-[#1c2434]" />
      </div>
    </>
  );
}
