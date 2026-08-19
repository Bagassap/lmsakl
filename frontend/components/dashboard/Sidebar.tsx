"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, LayoutDashboard, Bell, Users, Briefcase,
  FileText, UserCircle, ChevronDown,
  PanelLeftClose, PanelLeftOpen, Lock, KeyRound, Inbox,
  Building2, ClipboardCheck, Activity, FileBarChart,
  CalendarDays, Trophy, Search, ShieldCheck,
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

const TOGGLE_BTN_CLASS =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-white/80 transition-colors duration-200 hover:bg-white hover:text-primary";

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

  const [query, setQuery] = useState("");
  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.submenu?.some((s) => s.label.toLowerCase().includes(q)),
    );
  }, [items, query]);

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
            "relative flex h-full w-full flex-col overflow-hidden rounded-r-2xl bg-linear-to-b from-primary to-primary-dark shadow-xl shadow-primary/25",
            collapsed ? "px-2 py-4" : "p-4",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle,rgba(255,255,255,0.9)_1px,transparent_1px)] bg-size-[16px_16px]" />
          <div className="pointer-events-none absolute -right-14 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white/80 transition-colors duration-200 hover:bg-white hover:text-primary lg:hidden"
          >
            <X className="h-4 w-4" strokeWidth={2.25} />
          </button>

          <div className="relative z-10 flex h-full flex-col gap-4">
            <div className={collapsed ? "flex flex-col items-center gap-2" : "flex items-center justify-between gap-2 px-1"}>
              <span
                className={[
                  "flex shrink-0 items-center justify-center rounded-xl bg-white shadow-sm",
                  collapsed ? "h-9 w-9" : "h-9 px-2.5",
                ].join(" ")}
              >
                <Image src="/AKL.png" alt="LMS AKL" width={18} height={23} className="h-5 w-auto object-contain" />
                {!collapsed && <span className="ml-1.5 text-[13px] font-black tracking-tight text-primary">LMS AKL</span>}
              </span>

              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
                className={`hidden lg:flex ${TOGGLE_BTN_CLASS}`}
              >
                {collapsed ? <PanelLeftOpen className="h-4 w-4" strokeWidth={2.25} /> : <PanelLeftClose className="h-4 w-4" strokeWidth={2.25} />}
              </button>
            </div>

            {!collapsed && (
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-sm transition-colors focus-within:border-white/30 focus-within:bg-white/15">
                <Search className="h-4 w-4 shrink-0 text-white/70" strokeWidth={2.25} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari menu..."
                  className="w-full bg-transparent text-sm font-medium text-white placeholder:text-white/50 focus:outline-none"
                />
              </div>
            )}

            <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden">
              {visibleItems.map((item) => {
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
                          className="absolute inset-0 rounded-xl bg-white shadow-lg shadow-black/10"
                        />
                      )}
                      <span
                        className={[
                          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                          active ? "text-primary" : "text-white/75 group-hover:bg-white/10 group-hover:text-white",
                        ].join(" ")}
                      >
                        <item.icon size={17} />
                      </span>
                      {!collapsed && (
                        <>
                          <span className={["relative z-10 flex-1 text-left font-semibold", active ? "text-primary" : "text-white/85 group-hover:text-white"].join(" ")}>
                            {item.label}
                          </span>
                          {item.locked ? (
                            <Lock size={12} className={["relative z-10 shrink-0", active ? "text-primary/50" : "text-white/35"].join(" ")} />
                          ) : (
                            <ChevronDown
                              size={14}
                              className={[
                                "relative z-10 shrink-0 transition-transform duration-200",
                                isExp ? "rotate-180" : "",
                                active ? "text-primary" : "text-white/45",
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
                              <div className="ml-[27px] mb-1 mt-0.5 space-y-0.5 border-l border-white/15 pl-4">
                                {item.submenu.map((sub) => {
                                  const subActive = pathname === sub.href || pathname.startsWith(sub.href + "/");
                                  return (
                                    <Link
                                      key={sub.href}
                                      href={sub.href}
                                      onClick={onClose}
                                      className={[
                                        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] transition-colors duration-150",
                                        subActive ? "font-semibold text-white" : "font-normal text-white/55 hover:text-white/85",
                                      ].join(" ")}
                                    >
                                      <sub.icon size={12} className={subActive ? "text-white" : "text-white/45"} />
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
                        className="absolute inset-0 rounded-xl bg-white shadow-lg shadow-black/10"
                      />
                    )}
                    <span
                      className={[
                        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                        active ? "text-primary" : "text-white/75 group-hover:bg-white/10 group-hover:text-white",
                      ].join(" ")}
                    >
                      <item.icon size={17} />
                    </span>
                    {!collapsed && (
                      <span className={["relative z-10 flex-1 font-semibold", active ? "text-primary" : "text-white/85 group-hover:text-white"].join(" ")}>
                        {item.label}
                      </span>
                    )}
                    {item.key === "permintaan-password" && pendingResetCount > 0 && (
                      <span
                        className={[
                          "relative z-10 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                          active ? "bg-primary text-white" : "bg-white text-primary",
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

            <div className="border-t border-white/10 pt-3">
              <div className={["relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm", collapsed ? "flex justify-center p-2" : "p-2.5"].join(" ")}>
                <div className={`relative flex items-center ${collapsed ? "" : "gap-3"}`}>
                  <span className="relative shrink-0 rounded-full ring-2 ring-white/30">
                    <Avatar src={user.fotoProfil} nama={user.nama} sizePx={40} fallbackBg="rgba(255,255,255,0.25)" textClassName="text-xs" />
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-primary"
                    />
                  </span>
                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{user.nama}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white/90">
                          <ShieldCheck size={10} />
                          {ROLE_LABEL[user.role]}
                        </span>
                        {isSuperAdmin && (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white/90">
                            Superadmin
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!collapsed && (
                <p className="mt-3 px-1 text-[10px] leading-relaxed text-white/40">
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
