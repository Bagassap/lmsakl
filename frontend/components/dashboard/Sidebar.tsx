"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, LayoutDashboard, Bell, Users, Briefcase,
  FileText, UserCircle, ChevronDown,
  PanelLeftClose, PanelLeftOpen, Lock, KeyRound,
  Building2, ClipboardCheck, Activity, FileBarChart,
  CalendarDays, Trophy, ShieldCheck, BookOpen, NotebookPen,
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
    { key: "materi",       href: "/admin/materi",       label: "Materi",      icon: BookOpen },
    { key: "data-siswa",   href: "/admin/data-siswa",   label: "Data Siswa",  icon: Users },
    { key: "catatan-siswa", href: "/admin/catatan-siswa", label: "Catatan Siswa", icon: NotebookPen },
    { key: "manajemen-password", href: "/admin/manajemen-password", label: "Manajemen Password", icon: KeyRound },
    {
      key: "magang", label: "PKL", icon: Briefcase,
      submenu: [
        { href: "/admin/magang/penempatan", label: "Penempatan",    icon: Building2 },
        { href: "/admin/magang/absensi",    label: "Absensi",       icon: ClipboardCheck },
        { href: "/admin/magang/monitoring", label: "Monitoring",    icon: Activity },
        { href: "/admin/magang/rekap",      label: "Rekap & Laporan", icon: FileBarChart },
      ],
    },
    { key: "ujian-ukk", href: "/admin/ujian-ukk/jadwal-soal", label: "Jadwal & Soal UKK", icon: FileText },
  ],
  GURU: [
    { key: "dashboard",    href: "/guru/dashboard",    label: "Dashboard",   icon: LayoutDashboard },
    { key: "absensi-harian", href: "/guru/absensi-harian", label: "Absensi Harian", icon: ClipboardCheck },
    { key: "pengumuman",   href: "/guru/pengumuman",   label: "Pengumuman",  icon: Bell },
    { key: "materi",       href: "/guru/materi",       label: "Materi & Tugas", icon: BookOpen },
    { key: "data-siswa",   href: "/guru/data-siswa",   label: "Data Siswa",  icon: Users },
    { key: "catatan-siswa", href: "/guru/catatan-siswa", label: "Catatan Siswa", icon: NotebookPen },
    {
      key: "magang", href: "/guru/magang", label: "PKL", icon: Briefcase, locked: true,
      submenu: [
        { href: "/guru/magang/penempatan", label: "Penempatan",     icon: Building2 },
        { href: "/guru/magang/absensi",    label: "Absensi",        icon: ClipboardCheck },
        { href: "/guru/magang/monitoring", label: "Monitoring",     icon: Activity },
        { href: "/guru/magang/rekap",      label: "Rekap & Laporan",icon: FileBarChart },
      ],
    },
    { key: "ujian-ukk", href: "/guru/ujian-ukk/jadwal-soal", label: "Jadwal & Soal UKK", icon: FileText },
  ],
  SISWA: [
    { key: "dashboard",    href: "/siswa/dashboard",    label: "Dashboard",   icon: LayoutDashboard },
    { key: "absensi-harian", href: "/siswa/absensi-harian", label: "Absensi Harian", icon: ClipboardCheck },
    { key: "pengumuman",   href: "/siswa/pengumuman",   label: "Pengumuman",  icon: Bell },
    { key: "materi",       href: "/siswa/materi",       label: "Materi",      icon: BookOpen },
    { key: "catatan-siswa", href: "/siswa/catatan-siswa", label: "Catatan Saya", icon: NotebookPen },
    { key: "profil",       href: "/siswa/profil",       label: "Profil Saya", icon: UserCircle },
    {
      key: "magang", href: "/siswa/magang", label: "PKL", icon: Briefcase, locked: true,
      submenu: [
        { href: "/siswa/magang/penempatan", label: "Penempatan", icon: Building2 },
        { href: "/siswa/magang/absensi",    label: "Absensi",    icon: ClipboardCheck },
        { href: "/siswa/magang/rekap",      label: "Rekap",      icon: FileBarChart },
      ],
    },
    {
      key: "ujian-ukk", href: "/siswa/ujian-ukk", label: "UKK", icon: FileText, locked: true,
      submenu: [
        { href: "/siswa/ujian-ukk/jadwal-soal", label: "Jadwal & Soal", icon: CalendarDays },
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

const TOGGLE_BTN_CLASS =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-colors duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-400";

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
    (item) => item.key !== "manajemen-password" || isSuperAdmin,
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
    <>
      {open && (
        <div onClick={onClose} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex h-dvh shrink-0 flex-col transition-all duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-20" : "w-64",
        ].join(" ")}
      >
        <div
          className={[
            "relative flex h-full w-full flex-col overflow-hidden rounded-r-2xl border-r border-slate-100 bg-white shadow-xl shadow-black/5 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/30",
            collapsed ? "px-2 pb-4 pt-9" : "px-4 pb-4 pt-9",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-colors duration-200 hover:bg-primary hover:text-white dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-400 lg:hidden"
          >
            <X className="h-4 w-4" strokeWidth={2.25} />
          </button>

          <div className="relative z-10 flex h-full flex-col gap-4">
            <div className={[collapsed ? "flex flex-col items-center gap-2.5" : "flex items-center justify-between gap-2 px-1", "mb-5"].join(" ")}>
              <div className={collapsed ? "flex flex-col items-center" : "flex min-w-0 items-center gap-2.5"}>
                <span
                  className={[
                    "relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-lg shadow-primary/30",
                    collapsed ? "h-11 w-11" : "h-11 w-11",
                  ].join(" ")}
                  style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-brand-dark, #9E1B2E))" }}
                >
                  <span className="pointer-events-none absolute -right-2 -top-3 h-8 w-8 rounded-full bg-white/15" />
                  <span className="pointer-events-none absolute -bottom-3 -left-2 h-7 w-7 rounded-full bg-black/10" />
                  <Image src="/AKL.png" alt="LMS AKL" width={20} height={26} className="relative h-6 w-auto object-contain drop-shadow-sm" />
                </span>
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="text-[15px] font-black leading-tight tracking-tight text-slate-800 dark:text-white">
                      LMS <span className="text-primary">AKL</span>
                    </p>
                    <p className="truncate text-[10px] font-semibold leading-tight text-slate-400 dark:text-slate-500">
                      Akuntansi &amp; Keuangan Lembaga
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
                className={`hidden lg:flex ${TOGGLE_BTN_CLASS}`}
              >
                {collapsed ? <PanelLeftOpen className="h-4 w-4" strokeWidth={2.25} /> : <PanelLeftClose className="h-4 w-4" strokeWidth={2.25} />}
              </button>
            </div>

            <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden">
              {items.map((item) => {
                const active = isItemActive(item);
                const isExp  = expanded.has(item.key);

                if (item.submenu) {
                  const rowClass = [
                    "group relative flex w-full items-center rounded-xl text-sm transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] py-2.5",
                    collapsed ? "justify-center px-0" : "gap-3 pr-3 pl-2",
                  ].join(" ");

                  const inner = (
                    <>
                      {active && (
                        <motion.span
                          layoutId="sidebar-active-pill"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                          className="absolute inset-0 rounded-xl bg-primary shadow-md shadow-primary/25"
                        />
                      )}
                      <span
                        className={[
                          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                          active ? "text-white" : "text-slate-400 group-hover:bg-primary/10 group-hover:text-primary dark:text-slate-500",
                        ].join(" ")}
                      >
                        <item.icon size={17} />
                      </span>
                      {!collapsed && (
                        <>
                          <span className={["relative z-10 flex-1 text-left font-semibold", active ? "text-white" : "text-slate-600 group-hover:text-primary dark:text-slate-300"].join(" ")}>
                            {item.label}
                          </span>
                          {item.locked ? (
                            <Lock size={12} className={["relative z-10 shrink-0", active ? "text-white/60" : "text-slate-300 dark:text-slate-600"].join(" ")} />
                          ) : (
                            <ChevronDown
                              size={14}
                              className={[
                                "relative z-10 shrink-0 transition-transform duration-200",
                                isExp ? "rotate-180" : "",
                                active ? "text-white" : "text-slate-300 dark:text-slate-600",
                              ].join(" ")}
                            />
                          )}
                        </>
                      )}
                    </>
                  );

                  return (
                    <Fragment key={item.key}>
                      {item.locked && item.href ? (
                        <Link href={item.href} onClick={onClose} title={collapsed ? item.label : undefined} className={rowClass}>
                          {inner}
                        </Link>
                      ) : (
                        <button type="button" onClick={() => toggleExpand(item.key)} title={collapsed ? item.label : undefined} className={rowClass}>
                          {inner}
                        </button>
                      )}

                      {!collapsed && (
                        <AnimatePresence initial={false}>
                          {isExp && !item.locked && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="ml-[27px] mb-1 mt-0.5 space-y-0.5 border-l border-slate-100 pl-4 dark:border-slate-700">
                                {item.submenu.map((sub) => {
                                  const subActive = pathname === sub.href || pathname.startsWith(sub.href + "/");
                                  return (
                                    <Link
                                      key={sub.href}
                                      href={sub.href}
                                      onClick={onClose}
                                      className={[
                                        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] transition-colors duration-150",
                                        subActive ? "font-semibold text-primary" : "font-normal text-slate-500 hover:text-primary dark:text-slate-400",
                                      ].join(" ")}
                                    >
                                      <sub.icon size={12} className={subActive ? "text-primary" : "text-slate-400 dark:text-slate-500"} />
                                      <span>{sub.label}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </Fragment>
                  );
                }

                return (
                  <Link
                    key={item.key}
                    href={item.href!}
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    className={[
                      "group relative flex items-center rounded-xl text-sm transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] py-2.5",
                      collapsed ? "justify-center px-0" : "gap-3 pr-3 pl-2",
                    ].join(" ")}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active-pill"
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-primary shadow-md shadow-primary/25"
                      />
                    )}
                    <span
                      className={[
                        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                        active ? "text-white" : "text-slate-400 group-hover:bg-primary/10 group-hover:text-primary dark:text-slate-500",
                      ].join(" ")}
                    >
                      <item.icon size={17} />
                    </span>
                    {!collapsed && (
                      <span className={["relative z-10 flex-1 font-semibold", active ? "text-white" : "text-slate-600 group-hover:text-primary dark:text-slate-300"].join(" ")}>
                        {item.label}
                      </span>
                    )}
                    {item.key === "manajemen-password" && pendingResetCount > 0 && (
                      <span
                        className={[
                          "relative z-10 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                          active ? "bg-white text-primary" : "bg-primary text-white",
                          collapsed ? "absolute -right-1 -top-1" : "",
                        ].join(" ")}
                      >
                        {pendingResetCount > 99 ? "99+" : pendingResetCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-100 pt-3 dark:border-slate-700">
              <div className={["relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/40", collapsed ? "flex justify-center p-2" : "p-2.5"].join(" ")}>
                <div className={`relative flex items-center ${collapsed ? "" : "gap-3"}`}>
                  <span className="relative shrink-0 rounded-full ring-2 ring-white dark:ring-slate-800">
                    <Avatar src={user.fotoProfil} nama={user.nama} sizePx={40} fallbackBg="var(--color-primary)" textClassName="text-xs" />
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#FFE94B] ring-2 ring-white dark:ring-slate-800"
                    />
                  </span>
                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{user.nama}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          <ShieldCheck size={10} />
                          {ROLE_LABEL[user.role]}
                        </span>
                        {isSuperAdmin && (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-600 dark:text-slate-300">
                            Superadmin
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!collapsed && (
                <p className="mt-3 px-1 text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">
                  LMS AKL — SMK Ma&apos;arif NU 01 Limpung
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
