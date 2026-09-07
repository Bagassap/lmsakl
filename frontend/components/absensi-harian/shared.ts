import { CheckCircle2, MinusCircle, AlertCircle, Thermometer, LogOut, CalendarDays, CalendarRange, CalendarCheck2 } from "lucide-react";
import type { StatusAbsensi } from "./types";

export const STATUS_CFG: Record<StatusAbsensi, {
  label: string; bg: string; clr: string; darkBg: string; icon: React.ElementType;
}> = {
  HADIR: { label: "Hadir", bg: "#E3ECFF", clr: "#2962FF", darkBg: "#2962FF20", icon: CheckCircle2 },
  IZIN:  { label: "Izin",  bg: "#EBC4C4", clr: "#8B0000", darkBg: "#8B000020", icon: AlertCircle  },
  SAKIT: { label: "Sakit", bg: "#FAFAED", clr: "#B8B84A", darkBg: "#B8B84A20", icon: Thermometer  },
  ALPA:  { label: "Alpa",  bg: "#F8D6DA", clr: "#D7263D", darkBg: "#D7263D20", icon: MinusCircle  },
};

export const PULANG_CFG = {
  label: "Pulang", bg: "#ECEBE8", clr: "#5E0000", darkBg: "#5E000020", icon: LogOut,
};

export const STATUS_GRADIENT: Record<StatusAbsensi, string> = {
  HADIR: "#2962FF",
  IZIN:  "#8B0000",
  SAKIT: "#B8B84A",
  ALPA:  "#D7263D",
};
export const PULANG_GRADIENT = "#5E0000";

export const BRAND_GRADIENT = "#D7263D";

export const CARD_GRADIENTS = [
  "#D7263D",
  "#300000",
  "#2962FF",
  "#B8B84A",
  "#E8677A",
  "#5E0000",
];

export const CARD_ACCENT = ["#D7263D", "#300000", "#2962FF", "#B8B84A", "#E8677A", "#5E0000"];

export const DASHBOARD_GRADIENTS = [
  "#D7263D",
  "#C3F84A",
  "#FF5722",
  "#2962FF",
];
export const DASHBOARD_ACCENT = ["#D7263D", "#C3F84A", "#FF5722", "#2962FF"];
export const DASHBOARD_PASTEL = ["#F8D6DA", "#ECFCCB", "#FFE3D2", "#E3ECFF"];

export const WALLET_GRADIENTS = [
  "#D7263D",
  "#C3F84A",
  "#FF5722",
  "#2962FF",
];
export const WALLET_ON_LIME = [false, true, false, false];
export const WALLET_ON_TEXT = WALLET_ON_LIME.map((lime) => (lime ? "#000000" : "#FFFFFF"));

export function reportCardFg(gradient: string): string {
  return gradient === "#C3F84A" ? "#000000" : "#FFFFFF";
}

export const WALLET_WAVE_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='60' viewBox='0 0 120 60'%3E%3Cpath d='M0 30 Q15 10 30 30 T60 30 T90 30 T120 30' stroke='white' stroke-opacity='0.35' stroke-width='2' fill='none'/%3E%3Cpath d='M0 45 Q15 25 30 45 T60 45 T90 45 T120 45' stroke='white' stroke-opacity='0.22' stroke-width='2' fill='none'/%3E%3C/svg%3E\")";

export const WALLET_DOT_PATTERN = "radial-gradient(circle, rgba(255,255,255,0.55) 1.5px, transparent 1.5px)";
export const WALLET_DOT_SIZE = "18px 18px";

export const RANGE_MODE_CARDS: { key: "harian" | "mingguan" | "bulanan"; label: string; caption: string; icon: React.ElementType; gradient: string; onLime?: boolean }[] = [
  { key: "harian", label: "Harian", caption: "Rekap hari ini", icon: CalendarDays, gradient: "#8B0000" },
  { key: "mingguan", label: "Mingguan", caption: "Rekap minggu ini", icon: CalendarRange, gradient: "#C3F84A", onLime: true },
  { key: "bulanan", label: "Bulanan", caption: "Rekap bulan ini", icon: CalendarCheck2, gradient: "#D32F2F" },
];

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

export function formatTglSlash(tgl: string): string {
  const [y, m, d] = tgl.split("-");
  if (!y || !m || !d) return tgl;
  return `${d}/${m}/${y}`;
}

export type ExportRangeMode = "harian" | "mingguan" | "bulanan";
export type ExportRange =
  | { mode: "harian"; tanggal: string }
  | { mode: "mingguan"; tanggalMulai: string; tanggalSelesai: string }
  | { mode: "bulanan"; bulan: number; tahun: number };

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

const AVATAR_COLORS = ["#300000", "#D7263D", "#2962FF", "#B8B84A", "#5E0000", "#E8677A"];
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
