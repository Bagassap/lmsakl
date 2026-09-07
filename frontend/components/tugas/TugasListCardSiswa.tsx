"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList, Search, Send, CheckCircle, AlertCircle, CalendarClock, GraduationCap, Calculator, ListChecks, PenLine, Download, Lock,
} from "lucide-react";
import { formatTgl, isTugasActive, tipeLabel, LOCKDOWN_TIPE, maksimalPercobaanEfektif } from "./types";
import type { TugasItem, TugasSubmisiItem } from "./types";

const TIPE_BADGE: Record<string, { icon: typeof Calculator; cls: string }> = {
  PRAKTIK: { icon: Calculator, cls: "bg-[#E3ECFF] text-[#1745B0] dark:bg-[#1745B0]/40 dark:text-[#6B93FF]" },
  PILIHAN_GANDA: { icon: ListChecks, cls: "bg-[#F8D6DA] text-[#9E1B2E] dark:bg-[#5C1420]/40 dark:text-[#E8677A]" },
  ESSAY: { icon: PenLine, cls: "bg-[#E3ECFF] text-[#1745B0] dark:bg-[#1745B0]/40 dark:text-[#6B93FF]" },
};

const ROW_PALETTES = [
  { bar: "#2962FF", gradient: "#2962FF" },
  { bar: "#2962FF", gradient: "#2962FF" },
  { bar: "#300000", gradient: "#300000" },
  { bar: "#D7263D", gradient: "#D7263D" },
  { bar: "#1745B0", gradient: "#1745B0" },
];
function rowPalette(i: number) { return ROW_PALETTES[i % ROW_PALETTES.length]; }

function rowStatus(t: TugasItem, onKumpulkan: (t: TugasItem) => void, onLihatDetail: (s: TugasSubmisiItem, t: TugasItem) => void) {
  const mySubmisi = t.submisi?.[0];
  const isDiterima = mySubmisi?.status === "DITERIMA";
  const isRevisi = mySubmisi?.status === "REVISI";
  const isTerkirim = mySubmisi?.status === "TERKIRIM";
  const overdue = !isTugasActive(t) && !mySubmisi;
  const isLockdown = LOCKDOWN_TIPE.has(t.tipe);
  const isTerkunci = isLockdown && !!mySubmisi?.terkunci && !isDiterima;

  const btn = isTerkunci
    ? { label: "Percobaan Habis", icon: <Lock size={11} />, bg: "#F1F5F9", clr: "#94a3b8", border: "#e2e8f0", disabled: true, onClick: () => {} }
    : isDiterima
    ? { label: "Diterima", icon: <CheckCircle size={11} />, bg: "#ECFCCB", clr: "#4D7C0F", border: "#C3F84A", onClick: () => onLihatDetail(mySubmisi!, t) }
    : isRevisi
    ? { label: isLockdown ? "Kerjakan Ulang" : "Revisi", icon: <AlertCircle size={11} />, bg: "#D7263D", clr: "#D7263D", border: "#D7263D", onClick: () => (isLockdown ? onKumpulkan(t) : onLihatDetail(mySubmisi!, t)) }
    : isTerkirim
    ? { label: "Terkirim", icon: <CheckCircle size={11} />, bg: "#E3ECFF", clr: "#1745B0", border: "#1745B0", onClick: () => onLihatDetail(mySubmisi!, t) }
    : overdue
    ? { label: "Terlambat", icon: <AlertCircle size={11} />, bg: "#EBC4C4", clr: "#300000", border: "#300000", onClick: () => onKumpulkan(t) }
    : { label: t.tipe === "PILIHAN_GANDA" || t.tipe === "ESSAY" ? "Kerjakan" : t.tipe === "PRAKTIK" ? "Mulai Praktik" : "Kumpulkan", icon: <Send size={11} />, bg: "#E3ECFF", clr: "#2962FF", border: "#2962FF", onClick: () => onKumpulkan(t) };

  return { mySubmisi, isLockdown, isDiterima, btn };
}

export function TugasListCardSiswa({
  tugasList, loading, onKumpulkan, onLihatDetail,
}: {
  tugasList: TugasItem[];
  loading: boolean;
  onKumpulkan: (t: TugasItem) => void;
  onLihatDetail: (s: TugasSubmisiItem, t: TugasItem) => void;
}) {
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [search, setSearch] = useState("");

  const active = tugasList.filter((t) => isTugasActive(t));
  const completed = tugasList.filter((t) => !isTugasActive(t));
  const shown = (tab === "active" ? active : completed)
    .filter((t) => t.judul.toLowerCase().includes(search.trim().toLowerCase()) || t.mapel.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div>
    <div className="hidden bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden lg:flex lg:flex-col">
      <div className="px-5 pt-5 pb-0 bg-primary-light/40">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary">
            <ClipboardList size={14} className="text-white" />
          </div>
          <p className="text-base font-bold text-slate-800 dark:text-slate-100">Daftar Tugas Saya</p>
        </div>
        <div className="relative mb-3">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama tugas atau mapel..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200" />
        </div>
        <div className="flex gap-5 border-b border-slate-100 dark:border-slate-700">
          <button onClick={() => setTab("active")}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-all ${tab === "active" ? "border-[#2962FF]" : "text-slate-400 border-transparent hover:text-slate-600"}`}
            style={tab === "active" ? { color: "#2962FF" } : {}}>
            Aktif
            {tab === "active" && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-lg text-white font-bold" style={{ backgroundColor: "#2962FF" }}>{active.length}</span>}
          </button>
          <button onClick={() => setTab("completed")}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-all ${tab === "completed" ? "border-[#2962FF]" : "text-slate-400 border-transparent hover:text-slate-600"}`}
            style={tab === "completed" ? { color: "#2962FF" } : {}}>
            Selesai
            {tab === "completed" && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-lg text-white font-bold" style={{ backgroundColor: "#2962FF" }}>{completed.length}</span>}
          </button>
        </div>
      </div>

      <div className="max-h-[420px] overflow-auto">
        {loading && <div className="px-5 py-10 text-center text-sm text-slate-400">Memuat data...</div>}
        {!loading && shown.length === 0 && (
          <div className="px-5 py-12 text-center">
            <ClipboardList size={32} className="mx-auto mb-3 text-slate-200" />
            <p className="text-sm text-slate-400">{search.trim() ? `Tidak ada tugas dengan nama "${search.trim()}"` : "Belum ada tugas tersedia"}</p>
          </div>
        )}
        {!loading && shown.length > 0 && (
          <table className="w-full min-w-170 text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/90 backdrop-blur dark:border-slate-700/40 dark:bg-slate-700/60">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Tugas</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Mapel</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Deadline</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((t, idx) => {
                const rp = rowPalette(idx);
                const { mySubmisi, isLockdown, isDiterima, btn } = rowStatus(t, onKumpulkan, onLihatDetail);

                return (
                  <tr key={t.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-700/40 dark:hover:bg-slate-700/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm" style={{ background: rp.gradient }}>
                          <span className="text-xs font-bold text-white">{idx + 1}</span>
                        </div>
                        <p className="max-w-[180px] truncate text-sm font-bold text-slate-800 dark:text-slate-100">{t.judul}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          <GraduationCap size={10} /> {t.mapel}
                        </span>
                        {TIPE_BADGE[t.tipe] && (
                          <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold ${TIPE_BADGE[t.tipe].cls}`}>
                            {(() => { const Icon = TIPE_BADGE[t.tipe].icon; return <Icon size={10} />; })()} {tipeLabel(t.tipe)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><CalendarClock size={11} />{formatTgl(t.deadline)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {(t.tipe === "PILIHAN_GANDA" || t.tipe === "ESSAY") && mySubmisi?.nilai !== null && mySubmisi?.nilai !== undefined && (
                          <span className="inline-flex items-center rounded-lg bg-[#FCF0F1] px-2 py-1 text-[11px] font-bold text-[#C22540] dark:bg-[#5C1420]/20 dark:text-[#E8677A]">
                            Nilai {mySubmisi.nilai}
                          </span>
                        )}
                        {isLockdown && !!mySubmisi?.jumlahPercobaan && !isDiterima && (
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                            Percobaan {mySubmisi.jumlahPercobaan}/{maksimalPercobaanEfektif(mySubmisi)}
                          </span>
                        )}
                        {t.fileUrl && (
                          <a href={t.fileUrl} target="_blank" rel="noopener noreferrer" title={`Unduh lampiran${t.fileName ? `: ${t.fileName}` : ""}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-[#EEF3FF] hover:text-[#2962FF] dark:hover:bg-[#1745B0]/20">
                            <Download size={14} />
                          </a>
                        )}
                        <button onClick={btn.onClick} disabled={"disabled" in btn && btn.disabled}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                          style={{ borderColor: btn.border, color: btn.clr, backgroundColor: btn.bg }}>
                          {btn.icon}{btn.label}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>

    <div className="space-y-3 lg:hidden">
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama tugas atau mapel..."
          className="w-full rounded-2xl border border-slate-100 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.05)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-700 dark:bg-[#1c2434] dark:text-slate-200" />
      </div>

      <div className="isolate flex gap-1.5 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/60">
        <button type="button" onClick={() => setTab("active")}
          className="relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition-colors"
          style={{ color: tab === "active" ? "#fff" : "#94a3b8" }}>
          {tab === "active" && (
            <motion.span layoutId="tugasTabPill" className="absolute inset-0 rounded-xl bg-primary"
              transition={{ type: "spring", stiffness: 500, damping: 35 }} />
          )}
          <span className="relative z-10">Aktif</span>
          <span className="relative z-10 rounded-md px-1.5 py-0.5 text-[10px] font-bold"
            style={tab === "active" ? { background: "rgba(255,255,255,0.25)" } : { background: "#E2E8F0" }}>
            {active.length}
          </span>
        </button>
        <button type="button" onClick={() => setTab("completed")}
          className="relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition-colors"
          style={{ color: tab === "completed" ? "#fff" : "#94a3b8" }}>
          {tab === "completed" && (
            <motion.span layoutId="tugasTabPill" className="absolute inset-0 rounded-xl"
              style={{ background: "#2962FF" }} transition={{ type: "spring", stiffness: 500, damping: 35 }} />
          )}
          <span className="relative z-10">Selesai</span>
          <span className="relative z-10 rounded-md px-1.5 py-0.5 text-[10px] font-bold"
            style={tab === "completed" ? { background: "rgba(255,255,255,0.25)" } : { background: "#E2E8F0" }}>
            {completed.length}
          </span>
        </button>
      </div>

      {loading && (
        <div className="rounded-3xl bg-white py-14 text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:bg-[#1c2434]">
          <p className="text-sm text-slate-400">Memuat data...</p>
        </div>
      )}
      {!loading && shown.length === 0 && (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-14 text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:bg-[#1c2434]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "#C3F84A30" }}>
            <ClipboardList size={24} style={{ color: "#8A9E1F" }} />
          </div>
          <p className="mt-4 text-sm text-slate-400">{search.trim() ? `Tidak ada tugas dengan nama "${search.trim()}"` : "Belum ada tugas tersedia"}</p>
        </div>
      )}
      {!loading && shown.length > 0 && (
        <div className="space-y-2.5">
          {shown.map((t, idx) => {
            const accent = idx % 2 === 0;
            const d = rowStatus(t, onKumpulkan, onLihatDetail);
            return (
              <motion.div key={t.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                className={`relative overflow-hidden rounded-[22px] p-4 shadow-[0_4px_14px_-4px_rgba(0,0,0,0.10)] ${accent ? "bg-primary" : "bg-white dark:bg-[#1c2434]"}`}>
                {accent && <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10" />}
                <div className="relative flex items-center gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-bold ${accent ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-bold ${accent ? "text-white" : "text-slate-800 dark:text-white"}`}>{t.judul}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[9.5px] font-semibold ${accent ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}>
                        <GraduationCap size={9} /> {t.mapel}
                      </span>
                      {TIPE_BADGE[t.tipe] && (
                        <span className={`inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[9.5px] font-bold ${accent ? "bg-white/20 text-white" : TIPE_BADGE[t.tipe].cls}`}>
                          {(() => { const Icon = TIPE_BADGE[t.tipe].icon; return <Icon size={9} />; })()} {tipeLabel(t.tipe)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`relative mt-3 flex items-center justify-between gap-2 border-t pt-3 ${accent ? "border-white/20" : "border-black/[0.06] dark:border-slate-700/50"}`}>
                  <span className={`flex shrink-0 items-center gap-1 text-[10.5px] ${accent ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>
                    <CalendarClock size={11} />{formatTgl(t.deadline)}
                  </span>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {(t.tipe === "PILIHAN_GANDA" || t.tipe === "ESSAY") && d.mySubmisi?.nilai !== null && d.mySubmisi?.nilai !== undefined && (
                      <span className={`inline-flex items-center rounded-lg px-1.5 py-1 text-[10px] font-bold ${accent ? "bg-white/20 text-white" : "bg-[#FCF0F1] text-[#C22540] dark:bg-[#5C1420]/20 dark:text-[#E8677A]"}`}>
                        {d.mySubmisi.nilai}
                      </span>
                    )}
                    {t.fileUrl && (
                      <a href={t.fileUrl} target="_blank" rel="noopener noreferrer" title={`Unduh lampiran${t.fileName ? `: ${t.fileName}` : ""}`}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${accent ? "text-white/80 hover:bg-white/20 hover:text-white" : "text-slate-400 hover:bg-[#EEF3FF] hover:text-[#2962FF] dark:hover:bg-[#1745B0]/20"}`}>
                        <Download size={12} />
                      </a>
                    )}
                    <button onClick={d.btn.onClick} disabled={"disabled" in d.btn && d.btn.disabled}
                      className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[10.5px] font-bold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                      style={{
                        borderColor: d.btn.border, color: d.btn.clr, backgroundColor: d.btn.bg,
                        boxShadow: "disabled" in d.btn && d.btn.disabled ? undefined : `0 4px 10px -3px ${d.btn.clr}55`,
                      }}>
                      {d.btn.icon}{d.btn.label}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
    </div>
  );
}
