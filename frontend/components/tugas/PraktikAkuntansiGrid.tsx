"use client";

import { Plus, Trash2, CheckCircle, AlertCircle, RotateCcw } from "lucide-react";
import type { PraktikRow } from "./types";

const INPUT_CLS = "w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200";

function toNumber(v: string): number {
  const n = Number(v.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatRupiah(n: number): string {
  return n.toLocaleString("id-ID");
}

export function PraktikAkuntansiGrid({
  rows, onChange, readOnly = false, initialRows,
}: {
  rows: PraktikRow[];
  onChange?: (rows: PraktikRow[]) => void;
  readOnly?: boolean;
  // Kalau diisi, tombol Reset akan mengembalikan grid ke baris awal ini
  // (starter template yang disiapkan guru) alih-alih mengosongkan semua.
  initialRows?: PraktikRow[];
}) {
  function addRow() {
    onChange?.([...rows, { tanggal: "", akun: "", debit: "", kredit: "" }]);
  }
  function removeRow(idx: number) {
    onChange?.(rows.filter((_, i) => i !== idx));
  }
  function updateRow(idx: number, patch: Partial<PraktikRow>) {
    onChange?.(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }
  function reset() {
    onChange?.(initialRows ?? []);
  }

  const totalDebit = rows.reduce((s, r) => s + toNumber(r.debit), 0);
  const totalKredit = rows.reduce((s, r) => s + toNumber(r.kredit), 0);
  const balanced = rows.length > 0 && totalDebit === totalKredit;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-3 py-2 dark:border-slate-700 dark:bg-slate-700/20">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Jurnal Umum</p>
        {!readOnly && (
          <div className="flex items-center gap-1.5">
            {initialRows && (
              <button type="button" onClick={reset}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700">
                <RotateCcw size={12} /> Reset
              </button>
            )}
            <button type="button" onClick={addRow}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:brightness-105"
              style={{ background: "#FF5722" }}>
              <Plus size={12} /> Tambah Baris
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/90 dark:border-slate-700/40 dark:bg-slate-700/60">
            <tr>
              <th className="whitespace-nowrap px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Tanggal</th>
              <th className="whitespace-nowrap px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Akun</th>
              <th className="whitespace-nowrap px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Debit</th>
              <th className="whitespace-nowrap px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Kredit</th>
              {!readOnly && <th className="w-10 px-2 py-2" />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={readOnly ? 4 : 5} className="px-3 py-8 text-center text-xs text-slate-400">
                  {readOnly ? "Belum ada baris jurnal" : "Belum ada baris — klik \"Tambah Baris\" untuk mulai"}
                </td>
              </tr>
            )}
            {rows.map((r, idx) => (
              <tr key={idx} className="border-b border-slate-100 last:border-0 dark:border-slate-700/40">
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="text-xs text-slate-600 dark:text-slate-300">{r.tanggal || "—"}</span>
                  ) : (
                    <input type="date" value={r.tanggal} onChange={(e) => updateRow(idx, { tanggal: e.target.value })} className={INPUT_CLS} />
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{r.akun || "—"}</span>
                  ) : (
                    <input type="text" value={r.akun} onChange={(e) => updateRow(idx, { akun: e.target.value })}
                      placeholder="Nama akun" className={INPUT_CLS} />
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {readOnly ? (
                    <span className="text-xs text-slate-600 dark:text-slate-300">{r.debit ? formatRupiah(toNumber(r.debit)) : "—"}</span>
                  ) : (
                    <input type="number" value={r.debit} onChange={(e) => updateRow(idx, { debit: e.target.value })}
                      placeholder="0" className={`${INPUT_CLS} text-right`} />
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {readOnly ? (
                    <span className="text-xs text-slate-600 dark:text-slate-300">{r.kredit ? formatRupiah(toNumber(r.kredit)) : "—"}</span>
                  ) : (
                    <input type="number" value={r.kredit} onChange={(e) => updateRow(idx, { kredit: e.target.value })}
                      placeholder="0" className={`${INPUT_CLS} text-right`} />
                  )}
                </td>
                {!readOnly && (
                  <td className="px-2 py-2 text-right">
                    <button type="button" onClick={() => removeRow(idx)}
                      className="rounded-lg p-1.5 text-slate-300 hover:bg-[#FDEBEA] hover:text-[#D32F2F] dark:hover:bg-[#8B0000]/20">
                      <Trash2 size={13} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-2.5 dark:border-slate-700/60">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400">Total Debit <strong className="text-slate-700 dark:text-slate-200">{formatRupiah(totalDebit)}</strong></span>
          <span className="text-slate-400">Total Kredit <strong className="text-slate-700 dark:text-slate-200">{formatRupiah(totalKredit)}</strong></span>
        </div>
        {rows.length > 0 && (
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${balanced ? "text-black" : "text-white"}`}
            style={{ background: balanced ? "#C3F84A" : "#D32F2F" }}>
            {balanced ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
            {balanced ? "Balance" : "Belum Balance"}
          </span>
        )}
      </div>
    </div>
  );
}
