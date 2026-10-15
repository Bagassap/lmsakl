"use client";

import { CreditCard, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export const KARTU_PELAJAR_URL = "https://e-kartu.smklimpung.id";

export function KartuPelajarBanner({
  description = "Cek & cetak kartu pelajar siswa lewat portal e-Kartu",
  compact = false,
}: {
  description?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <motion.a
        href={KARTU_PELAJAR_URL}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.995 }}
        className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition-colors hover:border-primary/30 hover:bg-primary-light/20 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/40"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
            style={{
              background: "linear-gradient(155deg, rgba(255,255,255,0.4), rgba(255,255,255,0) 55%), #FF5722",
              boxShadow: "0 5px 10px -3px #FF572280, inset 0 2px 2px rgba(255,255,255,0.5), inset 0 -3px 4px rgba(0,0,0,0.18)",
            }}>
            <CreditCard size={16} />
          </div>
          <p className="truncate text-sm font-bold text-slate-800 dark:text-white">Kartu Pelajar</p>
        </div>
        <ArrowUpRight size={16} className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5" />
      </motion.a>
    );
  }

  return (
    <motion.a
      href={KARTU_PELAJAR_URL}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.995 }}
      className="group flex flex-col items-start gap-3 rounded-2xl border-2 border-[#FF5722] bg-[#FFF1EA] p-4 shadow-sm transition-colors hover:bg-[#FFF1EA]/70 sm:flex-row sm:items-center sm:justify-between dark:border-[#FF5722]/30 dark:bg-[#FF5722]/10 dark:hover:bg-[#FF5722]/15"
    >
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm animate-pulse [animation-duration:2.5s]"
          style={{ background: "#FF5722" }}>
          <CreditCard size={20} />
        </div>
        <div>
          <div className="mb-0.5 flex items-center gap-2">
            <p className="text-sm font-extrabold text-[#FF5722] dark:text-[#FF5722]">Kartu Pelajar Digital</p>
            <span className="rounded-lg bg-[#FF5722] px-2 py-0.5 text-[9px] font-bold text-white">Baru</span>
          </div>
          <p className="text-xs text-[#8A4218]/80 dark:text-[#FF5722]/70">{description}</p>
        </div>
      </div>

      <span className="flex shrink-0 items-center gap-1.5 self-start rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-transform group-hover:translate-x-0.5 sm:self-auto"
        style={{ background: "#FF5722" }}>
        Buka e-Kartu
        <ArrowUpRight size={14} />
      </span>
    </motion.a>
  );
}
