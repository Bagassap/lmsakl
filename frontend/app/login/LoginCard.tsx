"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Landmark, Scale } from "lucide-react";
import { LoginForm } from "./LoginForm";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
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
      className="relative z-10 flex h-[100dvh] w-full flex-col overflow-hidden bg-transparent shadow-none sm:h-auto sm:max-w-235 sm:flex-row-reverse sm:gap-4 sm:rounded-[36px] sm:bg-white sm:p-5 sm:shadow-[0_0_0_1px_rgba(180,83,9,0.14),0_4px_16px_rgba(215,38,61,0.08),0_20px_56px_rgba(215,38,61,0.14),0_40px_100px_rgba(180,83,9,0.10)]"
    >
      <div
        className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-8 sm:w-[300px] sm:shrink-0 sm:flex-none sm:rounded-3xl sm:px-10 sm:py-12"
        style={{ backgroundColor: "#D7263D" }}
      >
        <Scale className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 text-[#F0A3AC]/[0.08] sm:h-36 sm:w-36" />

        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#E8677A]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-[#5C1420]/25 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div
            variants={logoVariants}
            className="relative flex shrink-0 items-center justify-center"
          >
            <motion.div
              className="absolute h-32 w-32 rounded-full bg-[#E8677A]/30 blur-2xl sm:h-40 sm:w-40"
              animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#E8828C]/60 bg-white/95 p-2 shadow-[0_0_28px_rgba(215,38,61,0.55)] sm:h-24 sm:w-24 sm:p-3">
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

          <div className="relative z-10 mt-5 sm:mt-7">
            <p className="flex items-center justify-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.24em] text-[#F0A3AC]/70">
              <Landmark size={11} className="shrink-0" />
              Kompetensi Keahlian
            </p>

            <h1 className="mt-1 text-xl font-bold leading-[1.15] tracking-wide text-white sm:text-[1.85rem]">
              Akuntansi
              <br />
              <span>Keuangan Lembaga</span>
            </h1>

            <div className="mx-auto mt-3 h-px w-16 sm:mt-4 bg-[linear-gradient(90deg,transparent,rgba(215,38,61,0.9),rgba(220,38,38,0.6),transparent)]" />

            <p className="mt-3 text-[11.5px] font-light leading-relaxed text-[#FCF0F1]/60">
              Sistem Pembelajaran &amp; Presensi
              <br />
              Digital Siswa
            </p>

            <div className="mt-4 flex justify-center sm:mt-5">
              <span className="inline-flex items-center gap-2 rounded-lg border border-[#F0A3AC]/25 bg-white/[0.08] px-3.5 py-1.5 text-[9.5px] font-medium uppercase tracking-[0.12em] text-[#FCF0F1]/80">
                <span className="h-1 w-1 shrink-0 rounded-full bg-[#E8828C]" />
                SMK Ma&apos;arif NU 01 Limpung
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 flex-col rounded-t-3xl bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:flex-1 sm:rounded-3xl sm:px-12 sm:py-14">
        <h2 className="text-xl font-semibold text-stone-900 sm:text-2xl">Selamat Datang Kembali</h2>
        <p className="mt-2 hidden text-sm text-stone-500 sm:block">
          Masuk dengan NIS dan kata sandi Anda untuk mengakses LMS AKL
        </p>

        <LoginForm />

        <p className="mt-4 text-center text-[10px] text-stone-400 sm:mt-8 sm:text-xs">
          {`© ${new Date().getFullYear()} LMS AKL · SMK Ma'arif NU 01 Limpung`}
        </p>
      </div>
    </motion.div>
  );
}
