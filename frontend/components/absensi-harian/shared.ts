import { CheckCircle2, MinusCircle, AlertCircle, Thermometer, LogOut, CalendarDays, CalendarRange, CalendarCheck2 } from "lucide-react";
import type { StatusAbsensi } from "./types";

// Semua warna di file ini diturunkan dari 4 warna resmi palette brand:
// Tangerine Tango (oren) #FF5B19, Charcoal (hitam) #161616,
// Platinum (krem) #E5E3D2, Powder Blue (biru muda) #AECACD — tidak ada
// hue baru di luar 4 warna itu, hanya tint/shade (terang/gelap) dari
// masing-masing supaya tiap status/kartu tetap bisa dibedakan.
export const STATUS_CFG: Record<StatusAbsensi, {
  label: string; bg: string; clr: string; darkBg: string; icon: React.ElementType;
}> = {
  HADIR: { label: "Hadir", bg: "#E1EDEE", clr: "#6E9CA0", darkBg: "#6E9CA020", icon: CheckCircle2 }, // powder blue
  IZIN:  { label: "Izin",  bg: "#E8E7E4", clr: "#6E6E6E", darkBg: "#6E6E6E20", icon: AlertCircle  }, // charcoal muted
  SAKIT: { label: "Sakit", bg: "#F2F0E4", clr: "#9C9776", darkBg: "#9C977620", icon: Thermometer  }, // platinum gelap
  ALPA:  { label: "Alpa",  bg: "#FFE8DA", clr: "#FF5B19", darkBg: "#FF5B1920", icon: MinusCircle  }, // oren (paling perlu diperhatikan)
};

export const PULANG_CFG = {
  label: "Pulang", bg: "#ECEBE8", clr: "#3D3D3D", darkBg: "#3D3D3D20", icon: LogOut, // charcoal soft
};

// Gradients derived directly from each status's own `clr` (dark stop) blended
// toward a lighter tint of the same hue family (light stop) — tetap dalam 4
// warna palette, tidak memperkenalkan hue baru.
export const STATUS_GRADIENT: Record<StatusAbsensi, string> = {
  HADIR: "linear-gradient(135deg,#6E9CA0,#C3DBDD)",
  IZIN:  "linear-gradient(135deg,#6E6E6E,#B0B0B0)",
  SAKIT: "linear-gradient(135deg,#9C9776,#D4CFA8)",
  ALPA:  "linear-gradient(135deg,#FF5B19,#FFA372)",
};
export const PULANG_GRADIENT = "linear-gradient(135deg,#3D3D3D,#7A7A7A)";

export const BRAND_GRADIENT = "linear-gradient(160deg,#FF5B19 0%,#FF5B19 45%,#FF5B19 72%,#FF5B19 100%)";

export const CARD_GRADIENTS = [
  "linear-gradient(135deg,#FF5B19,#FF8A54)", // oren
  "linear-gradient(135deg,#161616,#3D3D3D)", // charcoal
  "linear-gradient(135deg,#6E9CA0,#AECACD)", // powder blue
  "linear-gradient(135deg,#9C9776,#C4C0A0)", // platinum gelap
  "linear-gradient(135deg,#FF8A54,#FFC49E)", // oren terang
  "linear-gradient(135deg,#3D3D3D,#6E6E6E)", // charcoal terang
];

// Solid dominant hue for each CARD_GRADIENTS entry — used to color an icon
// sitting on a solid white badge over that gradient, without ever needing
// an alpha/opacity color.
export const CARD_ACCENT = ["#FF5B19", "#161616", "#6E9CA0", "#9C9776", "#FF8A54", "#3D3D3D"];

// Same 4-warna palette rotation dipakai di "Akses Cepat" quick-access cards
// dashboard admin/guru/siswa (oren/charcoal/powder/platinum), supaya card
// besar di halaman ini terasa satu keluarga visual yang sama.
export const DASHBOARD_GRADIENTS = [
  "linear-gradient(135deg,#6E9CA0,#AECACD)", // powder blue
  "linear-gradient(135deg,#3D3D3D,#6E6E6E)", // charcoal
  "linear-gradient(135deg,#9C9776,#C4C0A0)", // platinum gelap
  "linear-gradient(135deg,#FF5B19,#FF5B19)", // oren
];
export const DASHBOARD_ACCENT = ["#6E9CA0", "#3D3D3D", "#9C9776", "#FF5B19"];
export const DASHBOARD_PASTEL = ["#E1EDEE", "#E8E7E4", "#F2F0E4", "#FFEDD5"];

// Wallet-card style palette for the "Kelas" row on the admin Absensi Harian
// page — cycling melalui 4 warna resmi palette per index kelas.
export const WALLET_GRADIENTS = [
  "linear-gradient(135deg,#FF5B19,#FF5B19)", // oren (brand)
  "linear-gradient(135deg,#161616,#3D3D3D)", // charcoal
  "linear-gradient(135deg,#6E9CA0,#AECACD)", // powder blue
  "linear-gradient(135deg,#9C9776,#C4C0A0)", // platinum gelap
];

// Subtle repeating wave-line texture drawn straight into each wallet card's
// gradient background, matching the reference's faint background pattern.
// Still used by the guru Absensi Harian page's kelas cards.
export const WALLET_WAVE_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='60' viewBox='0 0 120 60'%3E%3Cpath d='M0 30 Q15 10 30 30 T60 30 T90 30 T120 30' stroke='white' stroke-opacity='0.35' stroke-width='2' fill='none'/%3E%3Cpath d='M0 45 Q15 25 30 45 T60 45 T90 45 T120 45' stroke='white' stroke-opacity='0.22' stroke-width='2' fill='none'/%3E%3C/svg%3E\")";

// Dot-grid texture for the admin Absensi Harian page's kelas cards —
// a distinct corak from the guru page's wave pattern.
export const WALLET_DOT_PATTERN = "radial-gradient(circle, rgba(255,255,255,0.55) 1.5px, transparent 1.5px)";
export const WALLET_DOT_SIZE = "18px 18px";

// Mirrors the reference "Unduh Laporan PDF" card's 3 gradient period
// buttons exactly — same shape (icon + label + caption stacked, grid-cols-3)
// but toggles the shared exportRange's mode instead of firing a one-shot
// download, since our export needs a separate format pick below (4 kinds).
// Shared by both admin and guru's Absensi Harian pages.
export const RANGE_MODE_CARDS: { key: "harian" | "mingguan" | "bulanan"; label: string; caption: string; icon: React.ElementType; gradient: string }[] = [
  { key: "harian", label: "Harian", caption: "Rekap hari ini", icon: CalendarDays, gradient: "linear-gradient(135deg,#161616,#3D3D3D)" },
  { key: "mingguan", label: "Mingguan", caption: "Rekap minggu ini", icon: CalendarRange, gradient: "linear-gradient(135deg,#6E9CA0,#AECACD)" },
  { key: "bulanan", label: "Bulanan", caption: "Rekap bulan ini", icon: CalendarCheck2, gradient: "linear-gradient(135deg,#FF5B19,#FF5B19)" },
];

// Date.prototype.toISOString() always renders the UTC calendar date, not the
// browser's local one — during the ~7h/day window where WIB has already
// crossed into a new date but UTC hasn't (UTC 17:00-23:59 = WIB 00:00-06:59),
// `new Date().toISOString().slice(0, 10)` silently returns yesterday. Mirrors
// the backend's jakartaParts()/todayStr() in absensi-harian.service.ts.
export function todayJakarta(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function formatTgl(tgl?: string) {
  if (!tgl) return "-";
  return new Date(tgl).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export type ExportRangeMode = "harian" | "mingguan" | "bulanan";
export type ExportRange =
  | { mode: "harian"; tanggal: string }
  | { mode: "mingguan"; tanggalMulai: string; tanggalSelesai: string }
  | { mode: "bulanan"; bulan: number; tahun: number };

// Monday-Friday of the week containing `anchor` (yyyy-mm-dd) — hari efektif
// sekolah, mirrors effectiveWeekdaysInRange()/currentWindow() on the backend
// (Sabtu-Minggu never has an absen window). UTC-anchored arithmetic so the
// browser's local timezone can't shift which calendar day "anchor" lands on.
export function weekRangeFor(anchor: string): { start: string; end: string } {
  const [y, m, d] = anchor.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dow = date.getUTCDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() + mondayOffset);
  const friday = new Date(monday);
  friday.setUTCDate(monday.getUTCDate() + 4);
  const fmt = (dt: Date) => `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
  return { start: fmt(monday), end: fmt(friday) };
}

export const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const AVATAR_COLORS = ["#161616", "#FF5B19", "#6E9CA0", "#9C9776", "#3D3D3D", "#FF8A54"];
export function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function parseLokasi(raw: string | null | undefined) {
  if (!raw) return null;
  const parts = raw.split(",");
  if (parts.length >= 2) return { lat: parts[0].trim(), lng: parts[1].trim() };
  return null;
}

export { API_BASE, resolveMediaSrc } from "@/lib/media";
