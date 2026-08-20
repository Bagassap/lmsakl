"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Camera } from "lucide-react";
import { LengkapiFotoProfilForm } from "./LengkapiFotoProfilForm";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const logoVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] },
  },
};

export function LengkapiFotoProfilCard() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_0_0_1px_rgba(146,64,14,0.12),0_4px_16px_rgba(120,53,15,0.08),0_20px_56px_rgba(120,53,15,0.14),0_40px_100px_rgba(217,119,6,0.10)]"
    >
      {/* ── Header band: lockup horizontal, bukan panel sisi ────────── */}
      <div
        className="relative overflow-hidden px-6 py-5 sm:px-8 sm:py-6"
        style={{
          backgroundImage:
            "linear-gradient(115deg, #7C2D12 0%, #92400E 55%, #F59E0B 115%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex items-center gap-3.5">
          <motion.div variants={logoVariants} className="relative shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/95 p-1.5 shadow-[0_0_20px_rgba(251,191,36,0.55)] sm:h-14 sm:w-14">
              <Image
                src="/AKL.png"
                alt="Logo AKL"
                width={628}
                height={810}
                priority
                className="h-full w-auto object-contain"
              />
            </div>
          </motion.div>

          <div className="min-w-0 flex-1">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-orange-100/70">
              Satu Langkah Terakhir
            </p>
            <h1 className="mt-0.5 truncate text-lg font-bold text-white sm:text-xl">
              Lengkapi Foto Profil
            </h1>
          </div>

          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/85 sm:inline-flex">
            <Camera size={11} />
            Wajib
          </span>
        </div>
      </div>

      {/* ── Konten: form terpusat, bukan grid dua kolom ─────────────── */}
      <div className="flex flex-col items-center px-6 py-8 text-center sm:px-10 sm:py-10">
        <p className="max-w-xs text-sm leading-relaxed text-black/55">
          Unggah satu foto diri yang jelas (rasio 1:1). Foto ini menjadi identitas Anda
          di seluruh sistem dan hanya perlu diisi sekali.
        </p>

        <LengkapiFotoProfilForm />
      </div>
    </motion.div>
  );
}
