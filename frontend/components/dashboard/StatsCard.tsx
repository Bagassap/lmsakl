"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import type { LucideIcon } from "lucide-react";

const THEMES: { from: string; to: string; onLime: boolean }[] = [
  { from: "#D7263D", to: "#9E1B2E", onLime: false }, // merah (brand)
  { from: "#C3F84A", to: "#8FCB1F", onLime: true },  // lime
  { from: "#FF5722", to: "#C23D0F", onLime: false }, // oren
  { from: "#2962FF", to: "#1745B0", onLime: false }, // biru
];

function useCountUp(target: number, duration = 1200) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));
  useEffect(() => {
    const ctrl = animate(mv, target, { duration: duration / 1000, ease: [0.16, 1, 0.3, 1] });
    return () => ctrl.stop();
  }, [mv, target, duration]);
  return rounded;
}

export interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  sub?: string;
  delay?: number;
  index?: number;
  from?: string;
  to?: string;
  compact?: boolean;
}

export default function StatsCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  sub,
  delay = 0,
  index = 0,
}: StatsCardProps) {
  const count = useCountUp(value);
  const theme = THEMES[index % THEMES.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.07)] dark:bg-[#1c2434] sm:gap-4 sm:rounded-3xl sm:p-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle,rgba(0,0,0,0.9)_1px,transparent_1px)] bg-size-[16px_16px]"
      />

      <motion.span
        initial={{ scale: 0.6, opacity: 0, rotate: -15 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.1, rotate: 8 }}
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm sm:h-14 sm:w-14 sm:rounded-2xl ${theme.onLime ? "text-black" : "text-white"}`}
        style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
      >
        <Icon size={16} className="sm:hidden" />
        <Icon size={24} className="hidden sm:block" />
      </motion.span>

      <div className="relative min-w-0 flex-1">
        <div className="flex items-baseline gap-1">
          <motion.span className="text-lg font-bold text-slate-800 tabular-nums dark:text-white sm:text-2xl">
            {count}
          </motion.span>
          {suffix && <span className="text-[11px] font-semibold text-slate-400 sm:text-sm">{suffix}</span>}
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{label}</p>
        {sub && <p className="mt-0.5 truncate text-[9px] text-slate-400 dark:text-slate-500 sm:mt-1 sm:text-xs">{sub}</p>}
      </div>
    </motion.div>
  );
}
