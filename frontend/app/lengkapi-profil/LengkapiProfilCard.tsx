"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { LengkapiProfilForm } from "./LengkapiProfilForm";

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
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] },
  },
};

export function LengkapiProfilCard() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="relative z-10 flex w-full max-w-4xl flex-col gap-3 rounded-[36px] bg-white p-4 shadow-[0_0_0_1px_rgba(251,146,60,0.18),0_4px_16px_rgba(234,88,12,0.08),0_20px_56px_rgba(234,88,12,0.12),0_40px_100px_rgba(249,115,22,0.07)] sm:flex-row-reverse sm:gap-4 sm:p-5"
    >
      <div
        className="relative overflow-hidden rounded-3xl px-6 py-5 sm:w-[280px] sm:shrink-0 sm:px-8 sm:py-12"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 75% 10%, rgba(251,146,60,0.55), transparent 50%), linear-gradient(160deg, #FB923C 0%, #F97316 45%, #EA580C 72%, #9A3412 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />

        <div className="pointer-events-none absolute -left-16 -top-16 hidden h-48 w-48 rounded-full bg-[#FB923C]/50 blur-3xl sm:block" />
        <div className="pointer-events-none absolute -bottom-20 -right-16 hidden h-56 w-56 rounded-full bg-[#FED7AA]/30 blur-3xl sm:block" />

        <div className="relative z-10 flex flex-row items-center gap-3 sm:flex-col sm:gap-0 sm:text-center">
          <motion.div
            variants={logoVariants}
            className="relative flex shrink-0 items-center justify-center"
          >
            <motion.div
              className="absolute h-24 w-24 rounded-full bg-[#FB923C]/35 blur-2xl sm:h-40 sm:w-40"
              animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.85, 0.45] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div
              className="absolute hidden h-28 w-28 rounded-full blur-xl sm:block"
              style={{
                background:
                  "radial-gradient(circle, rgba(251,146,60,0.45), rgba(249,115,22,0.2) 60%, transparent 80%)",
              }}
            />
            <Image
              src="/AKL.png"
              alt="Logo AKL"
              width={628}
              height={810}
              priority
              className="relative h-12 w-auto sm:h-22"
              style={{
                filter:
                  "drop-shadow(0 0 22px rgba(251,146,60,0.7))",
              }}
            />
          </motion.div>

          <div className="relative z-10 sm:mt-8">
            <p className="hidden text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/45 sm:block">
              Wajib Diisi
            </p>

            <h1 className="mt-0.5 hidden text-[1.75rem] font-bold leading-[1.2] tracking-wide text-white sm:block">
              Lengkapi
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #FFF7ED 20%, #FB923C 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Profil
              </span>
            </h1>
            <h1 className="text-base font-semibold text-white sm:hidden">
              Lengkapi Profil
            </h1>

            <div
              className="mx-auto mt-4 hidden h-px w-16 sm:block"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(251,146,60,0.9), rgba(249,115,22,0.7), transparent)",
              }}
            />

            <p className="mt-3 hidden text-[11.5px] font-light leading-relaxed text-white/60 sm:block">
              Data ini wajib diisi sekali
              <br />
              sebelum lanjut ke dashboard
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center rounded-3xl bg-[#ffffff] px-8 py-10 sm:px-10 sm:py-12">
        <h2 className="text-2xl font-semibold text-black">Lengkapi Data Diri Anda</h2>
        <p className="mt-2 text-sm text-black/55">
          Sebelum melanjutkan, lengkapi data diri berikut ini. Semua field wajib diisi.
        </p>

        <LengkapiProfilForm />
      </div>
    </motion.div>
  );
}
