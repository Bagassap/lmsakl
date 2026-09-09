"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sheet, Save, Download, Loader2 } from "lucide-react";

const UniverSpreadsheet = dynamic(() => import("./UniverSpreadsheet").then((m) => m.UniverSpreadsheet), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700">
      <Loader2 size={20} className="animate-spin text-slate-400" />
    </div>
  ),
});

export function TugasSpreadsheetViewerModal({
  open, onClose, title, subtitle, snapshot, submisiId, nilai, canGrade, onSaveNilai,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  snapshot: string | null;
  submisiId: string | null;
  nilai?: number | null;
  canGrade?: boolean;
  onSaveNilai?: (nilai: number) => Promise<void>;
}) {
  const [nilaiInput, setNilaiInput] = useState(nilai != null ? String(nilai) : "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setNilaiInput(nilai != null ? String(nilai) : "");
  }, [open, nilai]);

  async function handleSaveNilai() {
    const parsed = Math.round(Number(nilaiInput));
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return;
    setSaving(true);
    try {
      await onSaveNilai?.(parsed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative flex h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-slate-800 sm:rounded-3xl">
            <div className="relative flex shrink-0 items-center gap-3 overflow-hidden px-6 py-4" style={{ background: "#FF5722" }}>
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Sheet size={18} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-extrabold text-white">{title}</h2>
                {subtitle && <p className="truncate text-xs text-white/70">{subtitle}</p>}
              </div>
              {nilai != null && (
                <div className="shrink-0 rounded-xl bg-white/15 px-3 py-1.5 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">Nilai</p>
                  <p className="text-lg font-black leading-none text-white">{nilai}</p>
                </div>
              )}
              {snapshot && submisiId && (
                <a href={`/api/tugas/submisi/${submisiId}/export-spreadsheet`} target="_blank" rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/25">
                  <Download size={13} /> Unduh .xlsx
                </a>
              )}
              <button onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25">
                <X size={16} />
              </button>
            </div>

            <div className="min-h-0 flex-1 p-5">
              {snapshot ? (
                <UniverSpreadsheet key={submisiId ?? "empty"} initialSnapshot={snapshot} readOnly />
              ) : (
                <p className="py-10 text-center text-sm text-slate-400">Belum ada jawaban.</p>
              )}
            </div>

            {canGrade && (
              <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-700">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nilai (0–100)</label>
                <input type="number" min={0} max={100} step={1} value={nilaiInput}
                  onChange={(e) => setNilaiInput(e.target.value)}
                  placeholder="0-100"
                  className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#FF5722] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200" />
                <button onClick={handleSaveNilai} disabled={saving || nilaiInput === ""}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-60">
                  <Save size={13} /> {saving ? "Menyimpan…" : "Simpan Nilai"}
                </button>
                {nilai != null && <span className="text-[11px] text-slate-400">Nilai tersimpan: {nilai}</span>}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
