import { CheckCircle2, MinusCircle, AlertCircle, Thermometer, LogOut, CalendarDays, CalendarRange, CalendarCheck2 } from "lucide-react";
import type { StatusAbsensi } from "./types";

// Semua warna di file ini diturunkan dari 4 warna resmi palette brand:
// Tangerine Tango (oren) #FF5722, Charcoal (hitam) #300000,
// Platinum (krem) #F5F5DC, Powder Blue (biru muda) #FFEF6B — tidak ada
// hue baru di luar 4 warna itu, hanya tint/shade (terang/gelap) dari
// masing-masing supaya tiap status/kartu tetap bisa dibedakan.
export const STATUS_CFG: Record<StatusAbsensi, {
  label: string; bg: string; clr: string; darkBg: string; icon: React.ElementType;
}> = {
  HADIR: { label: "Hadir", bg: "#FFFBD1", clr: "#FFEB3B", darkBg: "#FFEB3B20", icon: CheckCircle2 }, // powder blue
  IZIN:  { label: "Izin",  bg: "#EBC4C4", clr: "#8B0000", darkBg: "#8B000020", icon: AlertCircle  }, // charcoal muted
  SAKIT: { label: "Sakit", bg: "#FAFAED", clr: "#B8B84A", darkBg: "#B8B84A20", icon: Thermometer  }, // platinum gelap
  ALPA:  { label: "Alpa",  bg: "#FFDACB", clr: "#FF5722", darkBg: "#FF572220", icon: MinusCircle  }, // oren (paling perlu diperhatikan)
};

export const PULANG_CFG = {
  label: "Pulang", bg: "#ECEBE8", clr: "#5E0000", darkBg: "#5E000020", icon: LogOut, // charcoal soft
};

// Gradients derived directly from each status's own `clr` (dark stop) blended
// toward a lighter tint of the same hue family (light stop) — tetap dalam 4
// warna palette, tidak memperkenalkan hue baru.
export const STATUS_GRADIENT: Record<StatusAbsensi, string> = {
  HADIR: "#FFEB3B",
  IZIN:  "#8B0000",
  SAKIT: "#B8B84A",
  ALPA:  "#FF5722",
};
export const PULANG_GRADIENT = "#5E0000";

export const BRAND_GRADIENT = "#FF5722";

export const CARD_GRADIENTS = [
  "#FF5722", // oren
  "#300000", // charcoal
  "#FFEB3B", // powder blue
  "#B8B84A", // platinum gelap
  "#FF7440", // oren terang
  "#5E0000", // charcoal terang
];

// Solid dominant hue for each CARD_GRADIENTS entry — used to color an icon
// sitting on a solid white badge over that gradient, without ever needing
// an alpha/opacity color.
export const CARD_ACCENT = ["#FF5722", "#300000", "#FFEB3B", "#B8B84A", "#FF7440", "#5E0000"];

// Same 4-warna palette rotation dipakai di "Akses Cepat" quick-access cards
// dashboard admin/guru/siswa (oren/charcoal/powder/platinum), supaya card
// besar di halaman ini terasa satu keluarga visual yang sama.
export const DASHBOARD_GRADIENTS = [
  "#FFEB3B", // powder blue
  "#5E0000", // charcoal
  "#B8B84A", // platinum gelap
  "#FF5722", // oren
];
export const DASHBOARD_ACCENT = ["#FFEB3B", "#5E0000", "#B8B84A", "#FF5722"];
export const DASHBOARD_PASTEL = ["#FFFBD1", "#EBC4C4", "#FAFAED", "#FFDACB"];

// Wallet-card style palette for the "Kelas" row on the admin Absensi Harian
// page — cycling melalui 4 warna resmi palette per index kelas.
export const WALLET_GRADIENTS = [
  "#FF5722", // oren (brand)
  "#300000", // charcoal
  "#FFEB3B", // powder blue
  "#B8B84A", // platinum gelap
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
export const RANGE_MODE_CARDS: { key: "harian" | "mingguan" | "bulanan"; label: string; caption: string; icon: React.ElementType; gradient: string; onLime?: boolean }[] = [
  { key: "harian", label: "Harian", caption: "Rekap hari ini", icon: CalendarDays, gradient: "#8B0000" },
  { key: "mingguan", label: "Mingguan", caption: "Rekap minggu ini", icon: CalendarRange, gradient: "#C3F84A", onLime: true },
  { key: "bulanan", label: "Bulanan", caption: "Rekap bulan ini", icon: CalendarCheck2, gradient: "#D32F2F" },
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

const AVATAR_COLORS = ["#300000", "#FF5722", "#FFEB3B", "#B8B84A", "#5E0000", "#FF7440"];
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
