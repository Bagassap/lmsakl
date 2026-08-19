"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, LayoutDashboard, Bell, Users, Briefcase,
  FileText, UserCircle, ChevronRight, ChevronDown,
  ChevronsLeft, ChevronsRight, Lock, KeyRound, Inbox,
  Building2, ClipboardCheck, Activity, FileBarChart,
  CalendarDays, Trophy,
} from "lucide-react";
import type { UserPayload } from "@/lib/auth";
import { SUPER_ADMIN_LOGIN_ID } from "@/lib/constants";
import { Avatar } from "@/components/shared/Avatar";

type SubItem  = { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }> };
type MenuItem = {
  key: string;
  href?: string;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>;
  submenu?: SubItem[];
  locked?: boolean;
};

const MENUS: Record<string, MenuItem[]> = {
  ADMIN: [
    { key: "dashboard",    href: "/admin/dashboard",    label: "Dashboard",   icon: LayoutDashboard },
    { key: "absensi-harian", href: "/admin/absensi-harian", label: "Absensi Harian", icon: ClipboardCheck },
    { key: "pengumuman",   href: "/admin/pengumuman",   label: "Pengumuman",  icon: Bell },
    { key: "data-siswa",   href: "/admin/data-siswa",   label: "Data Siswa",  icon: Users },
    { key: "manajemen-password", href: "/admin/manajemen-password", label: "Manajemen Password", icon: KeyRound },
    { key: "permintaan-password", href: "/admin/permintaan-password", label: "Permintaan Password", icon: Inbox },
    {
      key: "magang", label: "Magang", icon: Briefcase,
      submenu: [
        { href: "/admin/magang/penempatan", label: "Penempatan",    icon: Building2 },
        { href: "/admin/magang/absensi",    label: "Absensi",       icon: ClipboardCheck },
        { href: "/admin/magang/monitoring", label: "Monitoring",    icon: Activity },
        { href: "/admin/magang/rekap",      label: "Rekap & Laporan", icon: FileBarChart },
      ],
    },
    {
      key: "ujian-ukk", label: "Ujian UKK", icon: FileText,
      submenu: [
        { href: "/admin/ujian-ukk/jadwal-soal", label: "Jadwal & Soal", icon: CalendarDays },
        { href: "/admin/ujian-ukk/absensi",     label: "Absensi",       icon: ClipboardCheck },
      ],
    },
  ],
  GURU: [
    { key: "dashboard",    href: "/guru/dashboard",    label: "Dashboard",   icon: LayoutDashboard },
    { key: "absensi-harian", href: "/guru/absensi-harian", label: "Absensi Harian", icon: ClipboardCheck },
    { key: "pengumuman",   href: "/guru/pengumuman",   label: "Pengumuman",  icon: Bell },
    { key: "data-siswa",   href: "/guru/data-siswa",   label: "Data Siswa",  icon: Users },
    {
      key: "magang", href: "/guru/magang", label: "Magang", icon: Briefcase, locked: true,
      submenu: [
        { href: "/guru/magang/penempatan", label: "Penempatan",     icon: Building2 },
        { href: "/guru/magang/absensi",    label: "Absensi",        icon: ClipboardCheck },
        { href: "/guru/magang/monitoring", label: "Monitoring",     icon: Activity },
        { href: "/guru/magang/rekap",      label: "Rekap & Laporan",icon: FileBarChart },
      ],
    },
    {
      key: "ujian-ukk", label: "Ujian UKK", icon: FileText,
      submenu: [
        { href: "/guru/ujian-ukk/jadwal-soal", label: "Jadwal & Soal", icon: CalendarDays },
        { href: "/guru/ujian-ukk/absensi",     label: "Absensi",       icon: ClipboardCheck },
      ],
    },
  ],
  SISWA: [
    { key: "dashboard",    href: "/siswa/dashboard",    label: "Dashboard",   icon: LayoutDashboard },
    { key: "absensi-harian", href: "/siswa/absensi-harian", label: "Absensi Harian", icon: ClipboardCheck },
    { key: "pengumuman",   href: "/siswa/pengumuman",   label: "Pengumuman",  icon: Bell },
    { key: "profil",       href: "/siswa/profil",       label: "Profil Saya", icon: UserCircle },
    {
      key: "magang", href: "/siswa/magang", label: "Magang", icon: Briefcase, locked: true,
      submenu: [
        { href: "/siswa/magang/penempatan", label: "Penempatan", icon: Building2 },
        { href: "/siswa/magang/absensi",    label: "Absensi",    icon: ClipboardCheck },
        { href: "/siswa/magang/rekap",      label: "Rekap",      icon: FileBarChart },
      ],
    },
    {
      key: "ujian-ukk", href: "/siswa/ujian-ukk", label: "Ujian UKK", icon: FileText, locked: true,
      submenu: [
        { href: "/siswa/ujian-ukk/jadwal-soal", label: "Jadwal & Soal", icon: CalendarDays },
        { href: "/siswa/ujian-ukk/absensi",     label: "Absensi",       icon: ClipboardCheck },
        { href: "/siswa/ujian-ukk/nilai-saya",  label: "Nilai Saya",    icon: Trophy },
      ],
    },
  ],
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrator",
  GURU:  "Pengajar",
  SISWA: "Pelajar",
};

// Sidebar merah solid (bukan putih) — kartu profil di header sekarang
// horizontal (avatar kiri, nama/role kanan) menggantikan blok besar
// vertikal-tengah dengan ring + pill kutipan dari versi sebelumnya.
const SIDEBAR_GRADIENT = "linear-gradient(180deg,#EF233C 0%,#D90429 55%,#A80320 100%)";
const AVATAR_RING = "#FBC9CE";

const TOGGLE_BTN_CLASS =
  "flex items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 shadow-sm transition-all duration-200 hover:border-white/35 hover:bg-white/20 hover:text-white";

const GREETINGS = [
  "Semoga harimu menyenangkan!",
  "Tetap semangat belajar hari ini!",
  "Sukses selalu untuk aktivitasmu!",
  "Jangan lupa istirahat, ya!",
  "Konsisten itu kunci keberhasilan.",
  "Hari baru, semangat baru!",
  "Terus berkarya dan berkembang!",
];

export function Sidebar({
  user, open, collapsed, onClose, onToggleCollapse,
}: {
  user: UserPayload;
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const isSuperAdmin = user.loginId === SUPER_ADMIN_LOGIN_ID;
  const items = (MENUS[user.role] ?? []).filter(
    (item) => (item.key !== "manajemen-password" && item.key !== "permintaan-password") || isSuperAdmin,
  );

  const [pendingResetCount, setPendingResetCount] = useState(0);
  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    fetch("/api/users/password-reset-requests", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { status: string }[]) => {
        if (!cancelled && Array.isArray(list)) {
          setPendingResetCount(list.filter((r) => r.status === "PENDING").length);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isSuperAdmin]);
  const greeting = GREETINGS[new Date().getDay() % GREETINGS.length];

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const item of items) {
      if (item.submenu?.some((sub) => pathname.startsWith(sub.href))) s.add(item.key);
    }
    return s;
  });

  function toggleExpand(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function isItemActive(item: MenuItem): boolean {
    if (item.href) return pathname === item.href || pathname.startsWith(item.href + "/");
    return item.submenu?.some((s) => pathname.startsWith(s.href)) ?? false;
  }

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-40 flex flex-col text-white transition-all duration-300 ease-in-out",
        "shadow-[4px_0_24px_rgba(168,3,32,0.28)]",
        collapsed ? "w-18" : "w-64",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      ].join(" ")}
      style={{ backgroundImage: SIDEBAR_GRADIENT }}
    >
      <div
        className={[
          "flex h-16 shrink-0 items-center border-b border-white/15",
          collapsed ? "justify-center" : "justify-between px-5",
        ].join(" ")}
      >
        {collapsed ? (
          <button
            onClick={onToggleCollapse}
            title="Buka sidebar"
            className={`h-9 w-9 ${TOGGLE_BTN_CLASS}`}
          >
            <ChevronsRight size={18} />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md shadow-black/20">
                <Image src="/AKL.png" alt="AKL" width={18} height={23} className="h-4.5 w-auto" />
              </div>
              <span className="flex items-baseline gap-1">
                <span className="text-[17px] font-black tracking-tight text-white">LMS</span>
                <span className="text-[11px] font-bold tracking-[0.15em] text-white/55">AKL</span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onClose}
                title="Tutup sidebar"
                className={`h-8 w-8 ${TOGGLE_BTN_CLASS} lg:hidden`}
              >
                <X size={16} />
              </button>

              <button
                onClick={onToggleCollapse}
                title="Sembunyikan sidebar"
                className={`hidden h-8 w-8 ${TOGGLE_BTN_CLASS} lg:flex`}
              >
                <ChevronsLeft size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="border-b border-white/15">
        {collapsed ? (
          <div className="flex justify-center py-3" title={user.nama}>
            <Avatar
              src={user.fotoProfil}
              nama={user.nama}
              sizePx={40}
              fallbackBg="rgba(255,255,255,0.15)"
              textClassName="text-sm font-extrabold"
            />
          </div>
        ) : (
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-3 py-3">
              <div className="rounded-full ring-2" style={{ "--tw-ring-color": AVATAR_RING } as React.CSSProperties}>
                <Avatar
                  src={user.fotoProfil}
                  nama={user.nama}
                  sizePx={44}
                  fallbackBg="rgba(255,255,255,0.18)"
                  textClassName="text-base font-extrabold"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold text-white">
                  Hello, {user.nama.split(" ")[0]}
                </p>
                <p className="mt-0.5 truncate text-[10.5px] text-white/60">
                  {ROLE_LABEL[user.role]} · SMK Ma&apos;arif
                </p>
              </div>
            </div>
            <p className="mt-2.5 px-1 text-[10.5px] italic leading-relaxed text-white/55">
              &ldquo;{greeting}&rdquo;
            </p>
          </div>
        )}
      </div>

      <nav className={["flex-1 overflow-y-auto", collapsed ? "px-2 py-2" : "px-3 py-2"].join(" ")}>
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active = isItemActive(item);
            const isExp  = expanded.has(item.key);

            if (collapsed) {
              return (
                <li key={item.key}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      title={item.label}
                      className="relative flex h-11 w-full items-center justify-center rounded-xl transition-all duration-200"
                    >
                      {active && (
                        <motion.div
                          layoutId="c-pill"
                          className="absolute inset-0 rounded-xl bg-white/20"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      {!active && (
                        <span className="absolute inset-0 rounded-xl transition-colors hover:bg-white/10" />
                      )}
                      <span className="relative flex h-7 w-7 items-center justify-center">
                        <item.icon size={17} style={{ color: active ? "#fff" : "rgba(255,255,255,0.6)" }} />
                        {item.key === "permintaan-password" && pendingResetCount > 0 && (
                          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-[#D90429]" />
                        )}
                      </span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => toggleExpand(item.key)}
                      title={item.label}
                      className="relative flex h-11 w-full items-center justify-center rounded-xl transition-all duration-200"
                    >
                      {active && (
                        <motion.div
                          layoutId="c-pill"
                          className="absolute inset-0 rounded-xl bg-white/20"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      {!active && (
                        <span className="absolute inset-0 rounded-xl transition-colors hover:bg-white/10" />
                      )}
                      <span className="relative flex h-7 w-7 items-center justify-center">
                        <item.icon size={17} style={{ color: active ? "#fff" : "rgba(255,255,255,0.6)" }} />
                      </span>
                    </button>
                  )}
                </li>
              );
            }

            if (item.submenu) {
              const innerContent = (
                <>
                  {active && (
                    <motion.div
                      layoutId="e-pill"
                      className="absolute inset-0 rounded-xl bg-white/15"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  {!active && (
                    <span className="absolute inset-0 rounded-xl transition-colors hover:bg-white/[0.08]" />
                  )}
                  <item.icon
                    size={17}
                    className="relative shrink-0"
                    style={{ color: active ? "#fff" : "rgba(255,255,255,0.6)" }}
                  />
                  <span
                    className={[
                      "relative flex-1 text-left text-[13px] font-semibold",
                      active ? "text-white" : "text-white/70",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                  {item.locked ? (
                    <Lock size={12} className="relative shrink-0 text-white/35" />
                  ) : (
                    <ChevronDown
                      size={14}
                      className={[
                        "relative shrink-0 transition-transform duration-200",
                        isExp ? "rotate-180" : "",
                        active ? "text-white" : "text-white/45",
                      ].join(" ")}
                    />
                  )}
                </>
              );

              return (
                <li key={item.key}>
                  {item.locked && item.href ? (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200"
                    >
                      {innerContent}
                    </Link>
                  ) : (
                    <button
                      onClick={() => toggleExpand(item.key)}
                      className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200"
                    >
                      {innerContent}
                    </button>
                  )}

                  <AnimatePresence initial={false}>
                    {isExp && !item.locked && (
                      <motion.ul
                        key="sub"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="ml-[30px] mt-1 mb-1 space-y-0.5 border-l border-white/15 pl-4">
                          {item.submenu.map((sub) => {
                            const subActive = pathname === sub.href || pathname.startsWith(sub.href + "/");
                            return (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  onClick={onClose}
                                  className={[
                                    "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] transition-all duration-150",
                                    subActive
                                      ? "font-semibold text-white"
                                      : "font-normal text-white/55 hover:text-white/80",
                                  ].join(" ")}
                                >
                                  <sub.icon
                                    size={12}
                                    style={{ color: subActive ? "#fff" : "rgba(255,255,255,0.5)" }}
                                  />
                                  <span>{sub.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </div>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              );
            }

            return (
              <li key={item.key}>
                <Link
                  href={item.href!}
                  onClick={onClose}
                  className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200"
                >
                  {active && (
                    <motion.div
                      layoutId="e-pill"
                      className="absolute inset-0 rounded-xl bg-white/15"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  {!active && (
                    <span className="absolute inset-0 rounded-xl transition-colors hover:bg-white/[0.08]" />
                  )}

                  <item.icon
                    size={17}
                    className="relative shrink-0"
                    style={{ color: active ? "#fff" : "rgba(255,255,255,0.6)" }}
                  />

                  <span
                    className={[
                      "relative flex-1 text-[13px] font-semibold",
                      active ? "text-white" : "text-white/70",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>

                  {item.key === "permintaan-password" && pendingResetCount > 0 && (
                    <span className="relative flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-bold text-[#D90429]">
                      {pendingResetCount > 99 ? "99+" : pendingResetCount}
                    </span>
                  )}

                  <ChevronRight
                    size={13}
                    className="relative shrink-0"
                    style={{ color: active ? "#fff" : "rgba(255,255,255,0.35)" }}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="shrink-0 border-t border-white/15 px-5 py-4">
          <p className="text-[10px] leading-relaxed text-white/45">
            LMS AKL — SMK Ma&apos;arif NU 01 Limpung
          </p>
          <p className="mt-0.5 text-[10px] text-white/30">
            © 2024 All Rights Reserved
          </p>
        </div>
      )}
    </aside>
  );
}
