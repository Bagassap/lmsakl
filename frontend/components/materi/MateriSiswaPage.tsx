"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Search, FileText, AlertCircle, GraduationCap, CalendarDays,
} from "lucide-react";
import type { MateriItem } from "./MateriFormModal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
}

const ROW_PALETTES = [
  { gradient: "#2962FF" },
  { gradient: "#B8B84A" },
  { gradient: "#D7263D" },
  { gradient: "#4D7C0F" },
  { gradient: "#E8677A" },
];
function rowPalette(i: number) { return ROW_PALETTES[i % ROW_PALETTES.length]; }

export function MateriSiswaPage({ embedded = false }: { embedded?: boolean } = {}) {
  const router = useRouter();
  const [list, setList] = useState<MateriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/materi");
        const data = await res.json();
        setList(Array.isArray(data) ? data : []);
      } catch {
        setError("Gagal memuat materi. Pastikan server berjalan.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((m) =>
      m.judul.toLowerCase().includes(q) ||
      m.mapel.toLowerCase().includes(q) ||
      (m.deskripsi ?? "").toLowerCase().includes(q)
    );
  }, [list, search]);

  return (
    <div className="space-y-5">
      {!embedded && (
        <div className="relative overflow-hidden rounded-2xl bg-primary p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-8 right-32 h-36 w-36 rounded-full bg-white/8" />
          <div className="relative flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg sm:h-14 sm:w-14">
              <BookOpen size={22} className="text-white sm:hidden" />
              <BookOpen size={26} className="hidden text-white sm:block" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Belajar Mandiri</span>
              <h1 className="text-xl font-extrabold leading-tight text-white sm:text-2xl">Materi Pembelajaran</h1>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="px-5 pt-5 pb-0 bg-primary-light/40">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary">
              <BookOpen size={14} className="text-white" />
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-slate-100">Daftar Materi</p>
            <span className="ml-1 rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{filtered.length} materi</span>
          </div>
          <div className="relative mb-4">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul materi, mapel, atau deskripsi..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200" />
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mx-5 mb-4 flex items-center gap-2 rounded-xl border border-[#EBC4C4] bg-[#F7E8E8] px-4 py-3 text-sm text-[#750000] dark:border-[#300000]/40 dark:bg-[#300000]/20 dark:text-[#A62E2E]">
              <AlertCircle size={14} className="shrink-0" />{error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-h-[560px] overflow-auto">
          {loading && <div className="px-5 py-10 text-center text-sm text-slate-400">Memuat data...</div>}
          {!loading && filtered.length === 0 && (
            <div className="px-5 py-14 text-center">
              <BookOpen size={32} className="mx-auto mb-3 text-slate-200" />
              <p className="text-sm text-slate-400">{search.trim() ? `Tidak ada materi dengan kata kunci "${search.trim()}"` : "Belum ada materi dari gurumu"}</p>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/90 backdrop-blur dark:border-slate-700/40 dark:bg-slate-700/60">
                <tr>
                  <th className="whitespace-nowrap px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Materi</th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Mata Pelajaran</th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Dibuat Oleh</th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Tanggal Dibuat</th>
                  <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, idx) => {
                  const rp = rowPalette(idx);
                  return (
                    <tr key={m.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-700/40 dark:hover:bg-slate-700/20">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm" style={{ background: rp.gradient }}>
                            <FileText size={13} className="text-white" />
                          </div>
                          <p className="max-w-[220px] truncate text-sm font-bold text-slate-800 dark:text-slate-100">{m.judul}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          <GraduationCap size={10} /> {m.mapel}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">{m.createdBy.nama}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><CalendarDays size={11} />{formatDate(m.createdAt)}</span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="flex items-center justify-end">
                          {m.fileUrl ? (
                            <button onClick={() => router.push(`/siswa/materi/${m.id}`)}
                              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-105">
                              <BookOpen size={12} /> Buka Modul
                            </button>
                          ) : (
                            <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                          )}
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
    </div>
  );
}
