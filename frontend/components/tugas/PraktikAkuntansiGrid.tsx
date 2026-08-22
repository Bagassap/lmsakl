"use client";

import { Fragment } from "react";
import { Plus, FilePlus2, Trash2, CheckCircle, AlertCircle, RotateCcw } from "lucide-react";
import type { PraktikRow } from "./types";

const INPUT_CLS = "w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200";
const GHOST_INPUT_CLS = "w-full border-0 bg-transparent px-0 py-1 text-xs italic text-slate-500 outline-none placeholder:text-slate-300 dark:text-slate-400 dark:placeholder:text-slate-600";

function emptyRow(patch?: Partial<PraktikRow>): PraktikRow {
  return { noBukti: "", tanggal: "", kodeAkun: "", akun: "", keterangan: "", debit: "", kredit: "", ...patch };
}

function toNumber(v: string): number {
  const n = Number(v.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatRupiah(n: number): string {
  return n.toLocaleString("id-ID");
}

function formatTglSingkat(v: string): string {
  if (!v) return "";
  const d = new Date(`${v}T00:00:00`);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// Nomor bukti berikutnya — kalau baris terakhir sudah punya nomor urut
// (mis. "005"), disarankan "006"; kalau tidak ada pola numerik, biarkan
// kosong supaya siswa isi manual.
function suggestNextNoBukti(rows: PraktikRow[]): string {
  const last = [...rows].reverse().find((r) => r.noBukti.trim());
  if (!last) return "001";
  const match = last.noBukti.match(/^(\D*)(\d+)(\D*)$/);
  if (!match) return "";
  const [, prefix, digits, suffix] = match;
  const next = String(Number(digits) + 1).padStart(digits.length, "0");
  return `${prefix}${next}${suffix}`;
}

// Baris-baris jurnal dikelompokkan per transaksi (kunci = noBukti berurutan
// sama) — satu transaksi biasanya 2+ baris akun (debit lalu kredit) diikuti
// satu baris keterangan, persis format jurnal umum di buku/modul akuntansi.
function groupByTransaksi(rows: PraktikRow[]): { key: string; indices: number[] }[] {
  const groups: { key: string; indices: number[] }[] = [];
  rows.forEach((r, idx) => {
    const last = groups[groups.length - 1];
    if (last && rows[last.indices[0]].noBukti === r.noBukti) {
      last.indices.push(idx);
    } else {
      groups.push({ key: `g${idx}`, indices: [idx] });
    }
  });
  return groups;
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
  const groups = groupByTransaksi(rows);

  // Menambah baris akun lain pada transaksi yang sedang berjalan (No. Bukti,
  // Tanggal, Keterangan ikut baris terakhir) — dipakai untuk menambahkan
  // baris akun kredit setelah baris akun debit pada transaksi yang sama.
  function addRowSameTransaksi() {
    const last = rows[rows.length - 1];
    onChange?.([...rows, emptyRow(last ? { noBukti: last.noBukti, tanggal: last.tanggal, keterangan: last.keterangan } : {})]);
  }
  function addTransaksiBaru() {
    onChange?.([...rows, emptyRow({ noBukti: suggestNextNoBukti(rows) })]);
  }
  function removeRow(idx: number) {
    const removed = rows[idx];
    const isFirstOfGroup = idx === 0 || rows[idx - 1].noBukti !== removed.noBukti;
    const next = rows[idx + 1];
    const groupContinues = isFirstOfGroup && next && next.noBukti === removed.noBukti;
    const updated = rows.filter((_, i) => i !== idx);
    if (groupContinues) {
      updated[idx] = { ...updated[idx], tanggal: removed.tanggal, keterangan: removed.keterangan };
    }
    onChange?.(updated);
  }
  function updateRow(idx: number, patch: Partial<PraktikRow>) {
    onChange?.(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }
  function updateGroupField(indices: number[], patch: Partial<PraktikRow>) {
    onChange?.(rows.map((r, i) => (indices.includes(i) ? { ...r, ...patch } : r)));
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
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Jurnal Umum</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Halaman: 1</p>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-1.5">
            {initialRows && (
              <button type="button" onClick={reset}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700">
                <RotateCcw size={12} /> Reset
              </button>
            )}
            <button type="button" onClick={addRowSameTransaksi}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Tambah baris akun lain pada transaksi yang sama (mis. baris kredit setelah baris debit)">
              <Plus size={12} /> Tambah Baris
            </button>
            <button type="button" onClick={addTransaksiBaru}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:brightness-105"
              style={{ background: "#D7263D" }}>
              <FilePlus2 size={12} /> Transaksi Baru
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/90 dark:border-slate-700/40 dark:bg-slate-700/60">
            <tr>
              <th className="whitespace-nowrap px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">No. Bukti</th>
              <th className="whitespace-nowrap px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Tanggal</th>
              <th className="whitespace-nowrap px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Keterangan</th>
              <th className="whitespace-nowrap px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Ref</th>
              <th className="whitespace-nowrap px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Debit</th>
              <th className="whitespace-nowrap px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Kredit</th>
              {!readOnly && <th className="w-10 px-2 py-2" />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={readOnly ? 6 : 7} className="px-3 py-8 text-center text-xs text-slate-400">
                  {readOnly ? "Belum ada baris jurnal" : "Belum ada baris — klik \"Transaksi Baru\" untuk mulai"}
                </td>
              </tr>
            )}
            {groups.map((g, gi) => {
              const firstIdx = g.indices[0];
              const first = rows[firstIdx];
              return (
                <Fragment key={g.key}>
                  {g.indices.map((idx, li) => {
                    const r = rows[idx];
                    const isKredit = toNumber(r.kredit) > 0 && toNumber(r.debit) === 0;
                    return (
                      <tr key={idx} className={`border-slate-100 dark:border-slate-700/40 ${gi > 0 && li === 0 ? "border-t-2 border-t-slate-200 dark:border-t-slate-600" : "border-t"}`}>
                        <td className="px-3 py-2 align-top">
                          {li !== 0 ? null : readOnly ? (
                            <span className="text-xs text-slate-500 dark:text-slate-400">{first.noBukti || "—"}</span>
                          ) : (
                            <input type="text" value={first.noBukti}
                              onChange={(e) => updateGroupField(g.indices, { noBukti: e.target.value })}
                              placeholder="001" className={INPUT_CLS} />
                          )}
                        </td>
                        <td className="px-3 py-2 align-top">
                          {li !== 0 ? null : readOnly ? (
                            <span className="text-xs text-slate-600 dark:text-slate-300">{formatTglSingkat(first.tanggal) || "—"}</span>
                          ) : (
                            <input type="date" value={first.tanggal}
                              onChange={(e) => updateGroupField(g.indices, { tanggal: e.target.value })} className={INPUT_CLS} />
                          )}
                        </td>
                        <td className="px-3 py-2" style={isKredit ? { paddingLeft: "2rem" } : undefined}>
                          {readOnly ? (
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{r.akun || "—"}</span>
                          ) : (
                            <input type="text" value={r.akun} onChange={(e) => updateRow(idx, { akun: e.target.value })}
                              placeholder="Nama akun" className={INPUT_CLS} />
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {readOnly ? (
                            <span className="text-xs text-slate-500 dark:text-slate-400">{r.kodeAkun || "—"}</span>
                          ) : (
                            <input type="text" value={r.kodeAkun} onChange={(e) => updateRow(idx, { kodeAkun: e.target.value })}
                              placeholder="111" className={INPUT_CLS} />
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {readOnly ? (
                            <span className="text-xs text-slate-600 dark:text-slate-300">{r.debit ? formatRupiah(toNumber(r.debit)) : ""}</span>
                          ) : (
                            <input type="number" value={r.debit} onChange={(e) => updateRow(idx, { debit: e.target.value })}
                              placeholder="0" className={`${INPUT_CLS} text-right`} />
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {readOnly ? (
                            <span className="text-xs text-slate-600 dark:text-slate-300">{r.kredit ? formatRupiah(toNumber(r.kredit)) : ""}</span>
                          ) : (
                            <input type="number" value={r.kredit} onChange={(e) => updateRow(idx, { kredit: e.target.value })}
                              placeholder="0" className={`${INPUT_CLS} text-right`} />
                          )}
                        </td>
                        {!readOnly && (
                          <td className="px-2 py-2 text-right align-top">
                            <button type="button" onClick={() => removeRow(idx)}
                              className="rounded-lg p-1.5 text-slate-300 hover:bg-[#FDEBEA] hover:text-[#D32F2F] dark:hover:bg-[#8B0000]/20">
                              <Trash2 size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  <tr key={`${g.key}-ket`} className="border-b border-slate-100 dark:border-slate-700/40">
                    <td />
                    <td />
                    <td className="px-3 pb-2" colSpan={readOnly ? 4 : 5}>
                      {readOnly ? (
                        <span className="text-xs italic text-slate-500 dark:text-slate-400">{first.keterangan ? `(${first.keterangan})` : ""}</span>
                      ) : (
                        <input type="text" value={first.keterangan}
                          onChange={(e) => updateGroupField(g.indices, { keterangan: e.target.value })}
                          placeholder="(keterangan transaksi)" className={GHOST_INPUT_CLS} />
                      )}
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-3 py-2.5 dark:border-slate-700/60">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="text-slate-400">Transaksi <strong className="text-slate-700 dark:text-slate-200">{groups.length}</strong></span>
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
