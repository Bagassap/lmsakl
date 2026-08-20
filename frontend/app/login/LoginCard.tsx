"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Landmark, Scale } from "lucide-react";
import { LoginForm } from "./LoginForm";

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
  hidden: { opacity: 0, scale: 0.7, rotate: -6 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] },
  },
};

export function LoginCard() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="relative z-10 grid w-full max-w-235 grid-cols-1 overflow-hidden rounded-tl-[20px] rounded-tr-[56px] rounded-bl-[56px] rounded-br-[20px] bg-white shadow-[0_0_0_1px_rgba(180,83,9,0.14),0_4px_16px_rgba(255,91,25,0.08),0_20px_56px_rgba(255,91,25,0.14),0_40px_100px_rgba(180,83,9,0.10)] md:grid-cols-[300px_1fr]"
    >
      {/* ── Panel kiri: identitas AKL ────────────────────────────────── */}
      <div
        className="relative overflow-hidden px-6 py-8 sm:px-10 sm:py-12"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 0%, rgba(255,91,25,0.35), transparent 55%), linear-gradient(165deg, #FF5B19 0%, #FF5B19 42%, #FF5B19 68%, #FF5B19 130%)",
        }}
      >
        {/* ikon dekoratif finansial, samar di pojok */}
        <Scale className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 text-amber-200/[0.08] sm:h-36 sm:w-36" />

        <div className="relative z-10 flex flex-row items-center gap-4 sm:flex-col sm:gap-0 sm:text-center">
          <motion.div
            variants={logoVariants}
            className="relative flex shrink-0 items-center justify-center"
          >
            <motion.div
              className="absolute h-20 w-20 rounded-full bg-amber-400/30 blur-2xl sm:h-40 sm:w-40"
              animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-300/60 bg-white/95 p-2 shadow-[0_0_28px_rgba(255,91,25,0.55)] sm:h-24 sm:w-24 sm:p-3">
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

          <div className="relative z-10 sm:mt-7">
            <p className="hidden items-center justify-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.24em] text-amber-200/70 sm:flex">
              <Landmark size={11} className="shrink-0" />
              Kompetensi Keahlian
            </p>

            <h1 className="mt-1 hidden text-[1.85rem] font-bold leading-[1.15] tracking-wide text-white sm:block">
              Akuntansi
              <br />
              <span>
                Keuangan Lembaga
              </span>
            </h1>
            <h1 className="text-base font-semibold text-white sm:hidden">
              Akuntansi &amp; Keuangan Lembaga
            </h1>

            <div className="mx-auto mt-4 hidden h-px w-16 sm:block bg-[linear-gradient(90deg,transparent,rgba(255,91,25,0.9),rgba(220,38,38,0.6),transparent)]" />

            <p className="mt-3 hidden text-[11.5px] font-light leading-relaxed text-amber-50/60 sm:block">
              Sistem Pembelajaran &amp; Presensi
              <br />
              Digital Siswa
            </p>

            <div className="mt-5 hidden sm:flex sm:justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-white/[0.08] px-3.5 py-1.5 text-[9.5px] font-medium uppercase tracking-[0.12em] text-amber-50/80">
                <span className="h-1 w-1 shrink-0 rounded-full bg-amber-300" />
                SMK Ma&apos;arif NU 01 Limpung
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sobekan tiket pemisah antar panel (hanya desktop) ──────────── */}
      <div className="pointer-events-none absolute inset-y-0 left-[300px] z-20 hidden w-4 -translate-x-1/2 md:block">
        <div className="mx-auto h-full w-px border-l-2 border-dashed border-amber-900/15" />
        <span className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-[#F2F0E4]" />
        <span className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-[#F2F0E4]" />
      </div>

      {/* ── Panel kanan: form login ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-center px-8 py-10 sm:px-12 sm:py-14">
        <h2 className="text-2xl font-semibold text-stone-900">Selamat Datang Kembali</h2>
        <p className="mt-2 text-sm text-stone-500">
          Masuk dengan NIS dan kata sandi Anda untuk mengakses LMS AKL
        </p>

        <LoginForm />

        <p className="mt-8 text-center text-xs text-stone-400">
          {`© ${new Date().getFullYear()} LMS AKL · SMK Ma'arif NU 01 Limpung`}
        </p>
      </div>
    </motion.div>
  );
}
