"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck, CalendarDays, BookOpen,
  ChevronLeft, ChevronRight,
  Users, TrendingUp, LogOut, FileText, Download, Send, Loader2,
} from "lucide-react";
import { useToast } from "@/components/shared/ToastSystem";
import { DokumenModal } from "@/components/absensi-harian/DokumenModal";
import { ExportButtons } from "@/components/absensi-harian/ExportButtons";
import { useExportRange } from "@/components/absensi-harian/useExportRange";
import { AbsensiHarianTable } from "@/components/absensi-harian/AbsensiHarianTable";
import { LaporanSeringTidakHadir } from "@/components/absensi-harian/LaporanSeringTidakHadir";
import { JadwalAbsenCard } from "@/components/absensi-harian/JadwalAbsenCard";
import { paginate } from "@/components/shared/PageSizeToggle";
import { STATUS_CFG, PULANG_CFG, WALLET_GRADIENTS, WALLET_ON_LIME, MONTH_NAMES, RANGE_MODE_CARDS, todayJakarta, formatTgl } from "@/components/absensi-harian/shared";
import type { Kelas, RekapKelas, SiswaAbsensi, FilterAbsensi } from "@/components/absensi-harian/types";

export default function AdminAbsensiHarianPage() {
  const toast = useToast();
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [tanggal, setTanggal] = useState(() => todayJakarta());
  const exportRange = useExportRange(tanggal);
  const [rekapAll, setRekapAll] = useState<RekapKelas[]>([]);
  const [loading, setLoading] = useState(false);
  const [dokumenSiswa, setDokumenSiswa] = useState<SiswaAbsensi | null>(null);
  const [dokumenSource, setDokumenSource] = useState<"hadir" | "pulang">("hadir");
  const [kelasPage, setKelasPage] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterAbsensi | null>(null);
  const [tablePage, setTablePage] = useState(0);
  const [tablePageSize, setTablePageSize] = useState<number>(10);
  const [sendingReminder, setSendingReminder] = useState(false);
  const KELAS_PER_PAGE = 4;

  const loadKelasList = useCallback(async () => {
    const res = await fetch("/api/kelas");
    const list = await res.json().catch(() => []);
    setKelasList(Array.isArray(list) ? list : []);
  }, []);

  useEffect(() => { loadKelasList(); }, [loadKelasList]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(kelasList.length / KELAS_PER_PAGE) - 1);
    setKelasPage((p) => Math.min(p, maxPage));
  }, [kelasList.length]);

  const loadRekap = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/absensi-harian?tanggal=${tanggal}`);
      const data = await res.json().catch(() => []);
      const list: RekapKelas[] = Array.isArray(data) ? data : [];
      setRekapAll(list);
      if (!selectedId && list.length > 0) setSelectedId(list[0].kelasId);
    } catch {
      toast.error("Gagal memuat data absensi", "");
    } finally {
      setLoading(false);
    }
  }, [tanggal]);

  useEffect(() => { loadRekap(); }, [loadRekap]);

  useEffect(() => { setTablePage(0); }, [selectedId, tanggal, activeFilter, tablePageSize]);

  const selected = rekapAll.find((r) => r.kelasId === selectedId) ?? null;
  const siswaList = selected?.siswa ?? [];
  const rekap = selected?.rekap ?? { HADIR: 0, IZIN: 0, SAKIT: 0, ALPA: 0 };
  const pulangCount = selected?.pulangCount ?? 0;
  const total = siswaList.length;
  const belumAbsenCount = siswaList.filter((s) => s.status === null).length;

  async function kirimPengingat() {
    if (!selectedId || belumAbsenCount === 0) return;
    setSendingReminder(true);
    try {
      const res = await fetch("/api/absensi-harian/kirim-pengingat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kelasId: selectedId, tanggal }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Gagal mengirim pengingat");
      toast.success("Pengingat terkirim", `${data?.count ?? 0} siswa menerima notifikasi pengingat absensi`);
    } catch (e) {
      toast.error("Gagal mengirim pengingat", e instanceof Error ? e.message : "Coba lagi");
    } finally {
      setSendingReminder(false);
    }
  }

  function kelasStat(k: Kelas) {
    const idx = kelasList.findIndex((x) => x.id === k.id);
    const r = rekapAll.find((x) => x.kelasId === k.id);
    const hd = r?.rekap.HADIR ?? 0;
    const iz = r?.rekap.IZIN ?? 0;
    const sk = r?.rekap.SAKIT ?? 0;
    const al = r?.rekap.ALPA ?? 0;
    const tt = r?.siswa.length ?? k._count?.siswa ?? 0;
    return { idx: idx < 0 ? 0 : idx, hd, iz, sk, al, tt, pct: tt > 0 ? Math.round((hd / tt) * 100) : 0 };
  }
  const kelasPageSlice = kelasList.slice(kelasPage * KELAS_PER_PAGE, kelasPage * KELAS_PER_PAGE + KELAS_PER_PAGE);
  const kelasPageCount = Math.ceil(kelasList.length / KELAS_PER_PAGE);

  const filteredSiswa = !activeFilter
    ? siswaList
    : activeFilter === "PULANG"
      ? siswaList.filter((s) => !!s.waktuPulang)
      : siswaList.filter((s) => s.status === activeFilter);
  const { pageItems: pagedSiswa, pageCount: tablePageCount, start: tableStart, end: tableEnd } = paginate(filteredSiswa, tablePage, tablePageSize);

  function toggleFilter(key: FilterAbsensi) {
    setActiveFilter((prev) => (prev === key ? null : key));
  }

  const hadirPct = total > 0 ? Math.round((rekap.HADIR / total) * 100) : 0;
  const filterOptions: { key: FilterAbsensi | null; label: string; icon: React.ElementType; count: number; color: string }[] = [
    { key: null, label: "Semua", icon: Users, count: total, color: "#334155" },
    { key: "HADIR", label: "Hadir", icon: STATUS_CFG.HADIR.icon, count: rekap.HADIR, color: STATUS_CFG.HADIR.clr },
    { key: "IZIN", label: "Izin", icon: STATUS_CFG.IZIN.icon, count: rekap.IZIN, color: STATUS_CFG.IZIN.clr },
    { key: "SAKIT", label: "Sakit", icon: STATUS_CFG.SAKIT.icon, count: rekap.SAKIT, color: STATUS_CFG.SAKIT.clr },
    { key: "ALPA", label: "Alpa", icon: STATUS_CFG.ALPA.icon, count: rekap.ALPA, color: STATUS_CFG.ALPA.clr },
    { key: "PULANG", label: "Pulang", icon: PULANG_CFG.icon, count: pulangCount, color: PULANG_CFG.clr },
  ];

  return (
    <>
      <div className="space-y-5 p-1">
        <div className="relative overflow-hidden rounded-2xl bg-primary p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-8 right-32 h-36 w-36 rounded-full bg-white/8" />
          <div className="relative flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg sm:h-14 sm:w-14">
              <ClipboardCheck size={22} className="text-white sm:hidden" />
              <ClipboardCheck size={26} className="hidden text-white sm:block" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Presensi Wajib Harian</span>
              <h1 className="text-xl font-extrabold leading-tight text-white sm:text-2xl">Absensi Harian</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 lg:col-span-2">
            <div className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Kelas</p>
                <div className="flex items-center gap-2">
                  {kelasPageCount > 1 && (
                    <span className="text-xs font-semibold text-slate-400">{kelasPage + 1} / {kelasPageCount}</span>
                  )}
                  <button type="button" onClick={() => setKelasPage((p) => Math.max(0, p - 1))} disabled={kelasPage === 0}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                    <ChevronLeft size={13} />
                  </button>
                  <button type="button" onClick={() => setKelasPage((p) => (p + 1 < kelasPageCount ? p + 1 : p))} disabled={kelasPage + 1 >= kelasPageCount}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              {kelasList.length === 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {kelasPageSlice.map((k) => {
                    const s = kelasStat(k);
                    const isSelected = k.id === selectedId;
                    const idx = s.idx % WALLET_GRADIENTS.length;
                    const gradient = WALLET_GRADIENTS[idx];
                    const onLime = WALLET_ON_LIME[idx];
                    return (
                      <button type="button" key={k.id} onClick={() => setSelectedId(k.id)}
                        className={`relative flex h-32 flex-col justify-between overflow-hidden rounded-2xl p-5 text-left transition-all ${onLime ? "text-black" : "text-white"}`}
                        style={{
                          background: gradient,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                          outline: isSelected ? "2px solid white" : "2px solid transparent",
                          outlineOffset: "3px",
                        }}>
                        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
                        <div className={`relative flex h-9 w-9 items-center justify-center rounded-2xl ${onLime ? "bg-black/15" : "bg-white/20"}`}>
                          <BookOpen size={16} />
                        </div>
                        <div className="relative">
                          <p className="truncate text-xl font-black leading-tight">{k.nama}</p>
                          <p className={`mt-0.5 truncate text-[11px] font-medium ${onLime ? "text-black/70" : "text-white/75"}`}>{s.hd}/{s.tt} hadir hari ini</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedId && (
                <button type="button" onClick={kirimPengingat} disabled={sendingReminder || belumAbsenCount === 0}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ background: "#8B0000" }}>
                  {sendingReminder ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  {belumAbsenCount === 0
                    ? "Semua siswa sudah absen"
                    : `Kirim Pengingat Absensi (${belumAbsenCount} siswa)`}
                </button>
              )}
            </div>

            <div className="border-t border-slate-100 p-5 dark:border-slate-700">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    Status Kehadiran Hari Ini <span className="font-medium text-slate-400">({total})</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{formatTgl(tanggal)}</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-600 dark:bg-slate-700/50 sm:w-full sm:max-w-xs">
                  <CalendarDays size={14} className="shrink-0 text-slate-400" />
                  <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}
                    className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-700 focus:outline-none dark:text-slate-200" />
                </div>
              </div>

              <div className="mt-6 mb-2 flex flex-wrap items-center gap-2.5 border-t border-slate-100 pt-6 pb-2 dark:border-slate-700">
                <span className="mr-1 text-xs font-semibold text-slate-400">Status:</span>
                {filterOptions.map((opt) => {
                  const active = activeFilter === opt.key;
                  return (
                    <button key={String(opt.key)} type="button"
                      onClick={() => (opt.key === null ? setActiveFilter(null) : toggleFilter(opt.key))}
                      className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
                      style={active ? { backgroundColor: opt.color, color: "#fff" } : {}}>
                      <span className={`flex items-center gap-2 ${active ? "text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"}`}>
                        <opt.icon size={16} />
                        {opt.label}
                        <span className={`rounded-md px-2 py-0.5 text-xs ${active ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700"}`}>
                          {opt.count}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-[11px] dark:border-slate-700">
                <span className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                  <Users size={12} className="text-[#8B0000]" />
                  Total {total} siswa
                </span>
                <span className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                  <TrendingUp size={12} className="text-[#8B0000]" />
                  Kehadiran {hadirPct}%
                </span>
                <span className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                  <LogOut size={12} className="text-[#8B0000]" />
                  Sudah pulang {pulangCount} siswa
                </span>
              </div>
            </div>

            <div className="overflow-hidden border-t border-slate-100 dark:border-slate-700">
              <AbsensiHarianTable
                loading={loading}
                hasSiswa={siswaList.length > 0}
                filteredSiswa={filteredSiswa}
                pagedSiswa={pagedSiswa}
                tableStart={tableStart}
                tableEnd={tableEnd}
                activeFilter={activeFilter}
                tablePage={tablePage}
                setTablePage={setTablePage}
                tablePageCount={tablePageCount}
                tablePageSize={tablePageSize}
                setTablePageSize={setTablePageSize}
                onOpenDokumen={(s, source) => { setDokumenSiswa(s); setDokumenSource(source); }}
              />
            </div>
          </div>

          <div className="flex h-full flex-col gap-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: "#5E0000" }}>
                  <FileText size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Unduh Laporan</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Ekspor rekap absensi ke PDF/Excel</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {RANGE_MODE_CARDS.map((opt) => {
                  const active = exportRange.rangeMode === opt.key;
                  return (
                    <button key={opt.key} type="button" onClick={() => exportRange.setRangeMode(opt.key)}
                      className={`flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-center shadow-sm transition-all ${opt.onLime ? "text-black" : "text-white"}`}
                      style={{ background: opt.gradient, opacity: active ? 1 : 0.55, outline: active ? "2px solid white" : "2px solid transparent", outlineOffset: active ? "2px" : "0" }}>
                      <opt.icon size={16} />
                      <span className="text-[11px] font-bold">{opt.label}</span>
                      <span className={`text-[9px] leading-tight ${opt.onLime ? "text-black/70" : "text-white/75"}`}>{opt.caption}</span>
                    </button>
                  );
                })}
              </div>

              {exportRange.rangeMode === "mingguan" && (
                <input type="date" value={exportRange.weekAnchor} onChange={(e) => exportRange.setWeekAnchor(e.target.value)}
                  title={`Minggu: ${formatTgl(exportRange.weekRange.start)} – ${formatTgl(exportRange.weekRange.end)}`}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#A62E2E] dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200" />
              )}

              {exportRange.rangeMode === "bulanan" && (
                <div className="mt-2 flex items-center gap-1.5">
                  <select value={exportRange.bulan} onChange={(e) => exportRange.setBulan(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#A62E2E] dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200">
                    {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                  <select value={exportRange.tahun} onChange={(e) => exportRange.setTahun(Number(e.target.value))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#A62E2E] dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200">
                    {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              )}

              <div className="mt-3">
                <ExportButtons kelasId={selectedId} kelasNama={selected?.kelas.nama ?? "Kelas"} range={exportRange.range} siswaList={siswaList} />
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                <Download size={11} className="shrink-0 text-[#8B0000]" />
                Pilih rentang waktu, lalu klik salah satu tombol ekspor
              </p>
            </div>

            <LaporanSeringTidakHadir kelasId={selectedId} kelasNama={selected?.kelas.nama} siswaList={siswaList} />

            <JadwalAbsenCard />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {dokumenSiswa && (
          <DokumenModal siswa={dokumenSiswa} tanggal={tanggal} kelas={selected?.kelas.nama ?? ""} source={dokumenSource} onClose={() => setDokumenSiswa(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
