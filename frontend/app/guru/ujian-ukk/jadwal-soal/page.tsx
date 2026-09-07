"use client";

import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  CalendarDays, FileText, BookOpen, Loader2,
  ChevronLeft, ChevronRight, X, Search,
  CloudUpload, Upload, Link2,
} from "lucide-react";
import { useToast } from "@/components/shared/ToastSystem";
import { todayJakarta } from "@/components/absensi-harian/shared";

const SoalPdfViewer = dynamic(() => import("./SoalPdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-[#D7263D]" />
    </div>
  ),
});

interface Soal { id: string; judul: string; deskripsi?: string; fileUrl: string; fileName: string; }
interface Tahapan { id: string; hariKe: number; judul: string; tanggal: string; jamMulai: string; jamSelesai: string; lokasi: string; penguji?: string; keterangan?: string; soal: Soal[]; }
interface Submisi { id: string; fileUrl: string; fileName: string; status: "TERKIRIM"|"DITERIMA"|"REVISI"; submittedAt: string; soal: { id: string; judul: string }; siswa: { id: string; nama: string; user: { id: string; nama: string } }; }

function formatTgl(s: string) { return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }

const ROW_PALETTES = [
  { bg:"#F8D6DA", text:"#D7263D",  bar:"#D7263D",  gradient:"#D7263D" }, // merah (brand)
  { bg:"#E3ECFF", text:"#2962FF",  bar:"#2962FF",  gradient:"#2962FF" }, // biru
  { bg:"#FFE3D2", text:"#FF5722",  bar:"#FF5722",  gradient:"#FF5722" }, // oren
  { bg:"#ECFCCB", text:"#4D7C0F",  bar:"#4D7C0F",  gradient:"#C3F84A" }, // lime
  { bg:"#E3ECFF", text:"#1745B0",  bar:"#1745B0",  gradient:"#1745B0" }, // biru tua
];
function rowPalette(i: number) { return ROW_PALETTES[i % ROW_PALETTES.length]; }

function isValidDriveUrl(url: string) {
  return url.startsWith("https://drive.google.com/") || url.startsWith("https://docs.google.com/");
}

function TambahSoalModal({ open, onClose, onUpload, tahapanList }: {
  open: boolean; onClose: () => void; onUpload: (fd: FormData) => Promise<void>; tahapanList: Tahapan[];
}) {
  const [tahapanId, setTahapanId]   = useState("");
  const [judul, setJudul]           = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [mode, setMode]             = useState<"file" | "link">("file");
  const [file, setFile]             = useState<File | null>(null);
  const [driveUrl, setDriveUrl]     = useState("");
  const [saving, setSaving]         = useState(false);
  const fileRef                     = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setTahapanId(tahapanList[0]?.id ?? ""); setJudul(""); setKeterangan(""); setMode("file"); setFile(null); setDriveUrl(""); }
  }, [open, tahapanList]);

  const linkValid = driveUrl.trim() !== "" && isValidDriveUrl(driveUrl.trim());
  const canSubmit = mode === "file" ? !!file : linkValid;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !tahapanId) return;
    setSaving(true);
    const fd = new FormData();
    fd.append("tahapanId", tahapanId);
    fd.append("judul", judul);
    fd.append("deskripsi", keterangan);
    if (mode === "file" && file) fd.append("file", file);
    else fd.append("driveUrl", driveUrl.trim());
    await onUpload(fd);
    setSaving(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}>
          <motion.div initial={{scale:0.95,opacity:0,y:16}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.95,opacity:0,y:16}}
            className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e)=>e.stopPropagation()}>

            <div className="relative px-6 py-5 overflow-hidden" style={{background: "#C3F84A"}}>
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-black/5 pointer-events-none"/>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-black">Tambah Soal</h2>
                <button onClick={onClose} className="w-7 h-7 rounded-lg bg-black/10 flex items-center justify-center text-black hover:bg-black/20">
                  <X size={14}/>
                </button>
              </div>
            </div>

            <form onSubmit={submit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Tahapan UKK</label>
                <select required value={tahapanId} onChange={(e)=>setTahapanId(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none">
                  <option value="">Pilih tahapan...</option>
                  {tahapanList.map((t)=><option key={t.id} value={t.id}>{t.judul}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Judul</label>
                <input required value={judul} onChange={(e)=>setJudul(e.target.value)}
                  placeholder="Masukkan judul..."
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-primary"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Keterangan</label>
                <textarea value={keterangan} onChange={(e)=>setKeterangan(e.target.value)} rows={3}
                  placeholder="Keterangan tambahan (opsional)..."
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none resize-none focus:border-primary"/>
              </div>

              <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-700/50">
                <button type="button" onClick={()=>setMode("file")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-colors ${mode==="file" ? "bg-white text-slate-800 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                  <Upload size={12}/> Upload File
                </button>
                <button type="button" onClick={()=>setMode("link")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-colors ${mode==="link" ? "bg-white text-slate-800 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                  <Link2 size={12}/> Link Google Drive
                </button>
              </div>

              {mode === "file" ? (
                <div onClick={()=>fileRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl p-5 text-center cursor-pointer hover:border-primary transition-colors">
                  <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                    onChange={(e)=>setFile(e.target.files?.[0]??null)}/>
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText size={16} className="text-[#D7263D]"/>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{file.name}</span>
                    </div>
                  ) : (
                    <>
                      <CloudUpload size={26} className="mx-auto text-slate-300 mb-1.5"/>
                      <p className="text-sm text-slate-500">Klik untuk upload <span className="font-semibold">PDF</span></p>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Link Google Drive</label>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-600 dark:bg-slate-700">
                    <Link2 size={15} className="shrink-0 text-slate-400"/>
                    <input value={driveUrl} onChange={(e)=>setDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-transparent text-sm text-slate-700 outline-none dark:text-slate-200"/>
                  </div>
                  {driveUrl.trim() !== "" && !linkValid && (
                    <p className="mt-1 text-[11px] font-semibold text-[#D7263D]">Link harus dari Google Drive (drive.google.com atau docs.google.com)</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Batal
                </button>
                <button type="submit" disabled={saving || !canSubmit || !tahapanId}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-60"
                  style={{background: "#C3F84A"}}>
                  {saving ? "Mengupload..." : "Upload"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function GuruJadwalSoalPage() {
  const [tahapanList, setTahapanList] = useState<Tahapan[]>([]);
  const [submisiList, setSubmisiList] = useState<Submisi[]>([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState<"active"|"completed"|"all">("all");
  const [taskSearch, setTaskSearch]   = useState("");
  const [expanded, setExpanded]       = useState<Set<string>>(new Set());
  const [openJadwalModal, setOpenJadwalModal] = useState(false);
  const [openSoalModal,   setOpenSoalModal]   = useState(false);
  const [soalJadwalIdx,   setSoalJadwalIdx]   = useState(0);
  const [soalSoalIdx,     setSoalSoalIdx]     = useState(0);
  const [openTambahSoal,  setOpenTambahSoal]  = useState(false);
  const toast = useToast();

  async function uploadSoal(fd: FormData) {
    try {
      const res = await fetch("/api/ujian-ukk/soal", { method: "POST", body: fd });
      if (res.ok) {
        toast.success("Soal ditambahkan", "");
        setOpenTambahSoal(false);
        loadAll();
      } else {
        const d = await res.json().catch(() => null);
        toast.error(d?.message ?? "Gagal menambahkan soal", "");
      }
    } catch {
      toast.error("Server tidak dapat dijangkau", "");
    }
  }

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [t, s] = await Promise.all([
      fetch("/api/ujian-ukk/tahapan").then(r => r.json()).catch(() => []),
      fetch("/api/ujian-ukk/submisi").then(r => r.json()).catch(() => []),
    ]);
    const list: Tahapan[] = Array.isArray(t) ? t : [];
    setTahapanList(list);
    setSubmisiList(Array.isArray(s) ? s : []);
    setLoading(false);
    const nowCheck = new Date();
    const todayCheck = todayJakarta();
    const hasActive = list.some(tk => {
      const tglStr = tk.tanggal?.slice(0, 10) ?? "";
      if (tglStr > todayCheck) return true;
      if (tglStr < todayCheck) return false;
      const [h, m] = (tk.jamSelesai ?? "23:59").split(":").map(Number);
      const selesai = new Date(); selesai.setHours(h, m, 0, 0);
      return nowCheck < selesai;
    });
    if (!hasActive && list.length > 0) setTab("completed");
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  function toggleExpand(id: string) { setExpanded(p=>{ const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; }); }

  const now      = new Date();
  const todayStr = todayJakarta();
  const active   = tahapanList.filter(t => {
    const tglStr = t.tanggal?.slice(0,10) ?? "";
    if (tglStr > todayStr) return true;
    if (tglStr < todayStr) return false;
    const [h,m] = (t.jamSelesai ?? "23:59").split(":").map(Number);
    const selesai = new Date(); selesai.setHours(h,m,0,0);
    return now < selesai;
  });
  const completed = tahapanList.filter(t => !active.includes(t));
  const shown     = (tab === "all" ? tahapanList : tab === "active" ? active : completed)
    .filter((t) => t.judul.toLowerCase().includes(taskSearch.trim().toLowerCase()));
  const totalSoal = tahapanList.flatMap(t=>t.soal).filter(s=>!s.deskripsi?.startsWith("__jadwal__:")).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="flex flex-col xl:flex-row gap-6">

        <div className="flex-1 min-w-0 space-y-6">

          <div className="relative overflow-hidden rounded-2xl bg-primary p-6">
            <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10"/>
            <div className="pointer-events-none absolute -bottom-8 right-32 h-36 w-36 rounded-full bg-white/8"/>
            <div className="relative flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg sm:h-14 sm:w-14">
                <FileText size={22} className="text-white sm:hidden"/>
                <FileText size={26} className="text-white hidden sm:block"/>
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase">Ujian Kompetensi Keahlian</span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">Jadwal &amp; Soal UKK</h1>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {openJadwalModal && (()=>{
              const allSoal = tahapanList.flatMap(t=>t.soal).filter(s=>s.deskripsi?.startsWith("__jadwal__:"));
              const curSoal = allSoal[soalJadwalIdx] ?? null;
              return (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                  onClick={e=>{if(e.target===e.currentTarget)setOpenJadwalModal(false)}}>
                  <motion.div initial={{scale:0.93,opacity:0,y:24}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.93,opacity:0,y:24}}
                    transition={{type:"spring",damping:26,stiffness:340}}
                    className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    style={{maxHeight:"92vh"}}>
                    <div className="relative flex items-start gap-4 px-6 py-5 overflow-hidden shrink-0"
                      style={{background:"#D7263D"}}>
                      <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none"/>
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <CalendarDays size={22} className="text-white"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="rounded-lg bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white/95">Jadwal UKK</span>
                        <h2 className="mt-1 text-lg font-extrabold text-white leading-snug line-clamp-2">
                          {curSoal ? curSoal.judul : "Jadwal UKK"}
                        </h2>
                        <p className="mt-0.5 text-[11px] text-white/70">{curSoal?.fileName ?? (allSoal.length===0 ? "Belum ada file jadwal" : `${allSoal.length} info UKK`)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {allSoal.length > 1 && (<>
                          <button onClick={()=>setSoalJadwalIdx(i=>Math.max(0,i-1))} disabled={soalJadwalIdx===0}
                            className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/30 disabled:opacity-40">
                            <ChevronLeft size={16}/>
                          </button>
                          <button onClick={()=>setSoalJadwalIdx(i=>Math.min(allSoal.length-1,i+1))} disabled={soalJadwalIdx===allSoal.length-1}
                            className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/30 disabled:opacity-40">
                            <ChevronRight size={16}/>
                          </button>
                        </>)}
                        <button onClick={()=>setOpenJadwalModal(false)}
                          className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/30">
                          <X size={16}/>
                        </button>
                      </div>
                    </div>
                    {curSoal ? (
                      <SoalPdfViewer soal={curSoal} onClose={()=>setOpenJadwalModal(false)}/>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                        <FileText size={30} className="text-[#E8828C]"/>
                        <p className="font-bold text-slate-700 dark:text-slate-200">Belum ada file jadwal</p>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          <AnimatePresence>
            {openSoalModal && (()=>{
              const allSoal = tahapanList.flatMap(t=>t.soal).filter(s=>!s.deskripsi?.startsWith("__jadwal__:"));
              const curSoal = allSoal[soalSoalIdx] ?? null;
              return (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                  onClick={e=>{if(e.target===e.currentTarget)setOpenSoalModal(false)}}>
                  <motion.div initial={{scale:0.93,opacity:0,y:24}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.93,opacity:0,y:24}}
                    transition={{type:"spring",damping:26,stiffness:340}}
                    className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    style={{maxHeight:"92vh"}}>
                    <div className="relative flex items-start gap-4 px-6 py-5 overflow-hidden shrink-0"
                      style={{background:"#C3F84A"}}>
                      <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-black/5 pointer-events-none"/>
                      <div className="w-12 h-12 rounded-xl bg-black/10 flex items-center justify-center shrink-0">
                        <FileText size={22} className="text-black"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="rounded-lg bg-black/10 px-2.5 py-0.5 text-[10px] font-bold text-black/80">Soal UKK</span>
                        <h2 className="mt-1 text-lg font-extrabold text-black leading-snug line-clamp-2">
                          {curSoal ? curSoal.judul : "Soal UKK"}
                        </h2>
                        <p className="mt-0.5 text-[11px] text-black/70">{curSoal?.fileName ?? `${totalSoal} soal tersedia`}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {allSoal.length > 1 && (<>
                          <button onClick={()=>setSoalSoalIdx(i=>Math.max(0,i-1))} disabled={soalSoalIdx===0}
                            className="w-8 h-8 rounded-xl bg-black/10 flex items-center justify-center text-black/70 hover:bg-black/20 disabled:opacity-40">
                            <ChevronLeft size={16}/>
                          </button>
                          <button onClick={()=>setSoalSoalIdx(i=>Math.min(allSoal.length-1,i+1))} disabled={soalSoalIdx===allSoal.length-1}
                            className="w-8 h-8 rounded-xl bg-black/10 flex items-center justify-center text-black/70 hover:bg-black/20 disabled:opacity-40">
                            <ChevronRight size={16}/>
                          </button>
                        </>)}
                        <button onClick={()=>{ setOpenSoalModal(false); setOpenTambahSoal(true); }}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-black/10 text-black hover:bg-black/20 transition-colors">
                          <CloudUpload size={13}/> Tambah
                        </button>
                        <button onClick={()=>setOpenSoalModal(false)}
                          className="w-8 h-8 rounded-xl bg-black/10 flex items-center justify-center text-black/70 hover:bg-black/20">
                          <X size={16}/>
                        </button>
                      </div>
                    </div>
                    {curSoal ? (
                      <SoalPdfViewer soal={curSoal} onClose={()=>setOpenSoalModal(false)}/>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                        <FileText size={30} className="text-[#4D7C0F]"/>
                        <p className="font-bold text-slate-700 dark:text-slate-200">Belum ada soal</p>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {(()=>{ const jadwalFiles = tahapanList.flatMap(t=>t.soal).filter(s=>s.deskripsi?.startsWith("__jadwal__:")); return (
          <div className="mb-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_2.3fr]">
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800 lg:col-start-1 lg:row-start-1">
              <p className="mb-4 text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Kategori</p>
              <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-col lg:gap-4">
                <button type="button" onClick={()=>{ setSoalJadwalIdx(0); setOpenJadwalModal(true); }}
                  className="relative flex h-24 flex-col justify-between overflow-hidden rounded-xl px-3 py-3 text-left text-white transition-all hover:scale-[1.01] active:scale-[0.99] sm:rounded-2xl lg:h-32 lg:px-5 lg:py-5"
                  style={{ background: "#D7263D", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
                  <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 lg:-right-6 lg:-top-6 lg:h-28 lg:w-28" />
                  <div className="relative flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 lg:h-9 lg:w-9 lg:rounded-2xl">
                    <CalendarDays size={14} className="lg:hidden" />
                    <CalendarDays size={16} className="hidden lg:block" />
                  </div>
                  <div className="relative min-w-0">
                    <p className="truncate text-sm font-black leading-tight sm:text-base lg:text-xl">Jadwal<span className="text-white/70"> UKK</span></p>
                    <p className="mt-0.5 truncate text-[9px] font-medium text-white/75 sm:text-[10px] lg:text-[11px]">{jadwalFiles.length} file jadwal · TA 2026/2027</p>
                  </div>
                </button>

                <button type="button" onClick={()=>{ setSoalSoalIdx(0); setOpenSoalModal(true); }}
                  className="relative flex h-24 flex-col justify-between overflow-hidden rounded-xl px-3 py-3 text-left text-black transition-all hover:scale-[1.01] active:scale-[0.99] sm:rounded-2xl lg:h-32 lg:px-5 lg:py-5"
                  style={{ background: "#C3F84A", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
                  <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-black/5 lg:-right-6 lg:-top-6 lg:h-28 lg:w-28" />
                  <div className="relative flex h-7 w-7 items-center justify-center rounded-xl bg-black/10 lg:h-9 lg:w-9 lg:rounded-2xl">
                    <FileText size={14} className="lg:hidden" />
                    <FileText size={16} className="hidden lg:block" />
                  </div>
                  <div className="relative min-w-0">
                    <p className="truncate text-sm font-black leading-tight sm:text-base lg:text-xl">Soal<span className="text-black/70"> UKK</span></p>
                    <p className="mt-0.5 truncate text-[9px] font-medium text-black/75 sm:text-[10px] lg:text-[11px]">{totalSoal} soal diunggah · TA 2026/2027</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="px-5 pt-5 pb-0" style={{background:"rgba(215,38,61,0.05)"}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"#D7263D"}}>
                      <BookOpen size={14} className="text-white"/>
                    </div>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">My Task</p>
                  </div>
                </div>
                <div className="relative mb-3">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" />
                  <input value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)}
                    placeholder="Cari nama task..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200" />
                </div>
                <div className="flex gap-5 border-b border-slate-100 dark:border-slate-700">
                  <button onClick={()=>setTab("all")}
                    className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-all ${tab==="all" ? "border-slate-500" : "text-slate-400 border-transparent hover:text-slate-600"}`}
                    style={tab==="all"?{color:"#64748B"}:{}}>
                    Semua
                    {tab==="all" && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-lg text-white font-bold" style={{backgroundColor:"#64748B"}}>{tahapanList.length}</span>}
                  </button>
                  <button onClick={()=>setTab("active")}
                    className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-all ${tab==="active" ? "border-primary" : "text-slate-400 border-transparent hover:text-slate-600"}`}
                    style={tab==="active"?{color:"#D7263D"}:{}}>
                    Aktif
                    {tab==="active" && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-lg text-white font-bold" style={{backgroundColor:"#D7263D"}}>{active.length}</span>}
                  </button>
                  <button onClick={()=>setTab("completed")}
                    className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-all ${tab==="completed" ? "border-[#4D7C0F]" : "text-slate-400 border-transparent hover:text-slate-600"}`}
                    style={tab==="completed"?{color:"#4D7C0F"}:{}}>
                    Selesai
                    {tab==="completed" && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-lg text-white font-bold" style={{backgroundColor:"#4D7C0F"}}>{completed.length}</span>}
                  </button>
                </div>
              </div>

              <div className="max-h-[330px] overflow-auto">
                {loading && <div className="px-5 py-10 text-center text-sm text-slate-400">Memuat data...</div>}
                {!loading && shown.length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <CalendarDays size={32} className="mx-auto mb-3 text-slate-200"/>
                    <p className="text-sm text-slate-400">{taskSearch.trim() ? `Tidak ada task dengan nama "${taskSearch.trim()}"` : tab==="active" ? "Tidak ada task aktif" : tab==="completed" ? "Tidak ada task selesai" : "Belum ada task"}</p>
                  </div>
                )}
                {!loading && shown.length > 0 && (
                  <table className="w-full min-w-170 text-left text-sm">
                    <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/90 backdrop-blur dark:border-slate-700/40 dark:bg-slate-700/60">
                      <tr>
                        <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Task</th>
                        <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Tanggal</th>
                        <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Waktu</th>
                        <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Lokasi</th>
                        <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Terkumpul</th>
                        <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((t, idx) => {
                        const rp  = rowPalette(idx);
                        const exp = expanded.has(t.id);
                        const submisiTahapan = submisiList.filter(s => t.soal.some(so => so.id === s.soal?.id));
                        const sudahKumpul = submisiTahapan.length;
                        const pct = Math.min(Math.round((sudahKumpul / Math.max(totalSoal,1))*100),100);
                        const onLime = rp.gradient === "#C3F84A";
                        return (
                          <Fragment key={t.id}>
                            <tr className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-700/40 dark:hover:bg-slate-700/20">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm" style={{background:rp.gradient}}>
                                    <span className={`text-xs font-bold ${onLime ? "text-black" : "text-white"}`}>{idx+1}</span>
                                  </div>
                                  <p className="max-w-[160px] truncate text-sm font-bold text-slate-800 dark:text-slate-100">{t.judul}</p>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{formatTgl(t.tanggal)}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{t.jamMulai}–{t.jamSelesai}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{t.lokasi}</td>
                              <td className="whitespace-nowrap px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                                    <div className="h-full rounded-full" style={{width:`${pct}%`, background:rp.gradient}}/>
                                  </div>
                                  <span className="text-xs font-bold" style={{color:rp.bar}}>{pct}%</span>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-right">
                                <button onClick={()=>toggleExpand(t.id)}
                                  className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all"
                                  style={{borderColor:rp.bar, color:rp.bar, backgroundColor:rp.bg}}>
                                  <BookOpen size={11}/>
                                  Lihat
                                  {sudahKumpul > 0 && (
                                    <span className="rounded-lg px-1.5 py-0.5 text-[9px] font-bold text-white" style={{backgroundColor:rp.bar}}>{sudahKumpul}</span>
                                  )}
                                </button>
                              </td>
                            </tr>
                            {exp && (
                              <tr className="border-b border-slate-100 dark:border-slate-700/40">
                                <td colSpan={6} className="bg-slate-50/50 p-0 dark:bg-slate-700/20">
                                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-700">
                                    <span>Hasil Kerja Siswa</span>
                                    <span className="text-[10px] normal-case font-semibold">{submisiTahapan.length} pengumpulan</span>
                                  </div>
                                  {submisiTahapan.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-xs text-slate-400">Belum ada siswa yang mengumpulkan</div>
                                  ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
                                      {submisiTahapan.map(s => {
                                        const statusCfg: Record<string,{label:string;color:string;bg:string}> = {
                                          DITERIMA:{ label:"Diterima", color:"#4D7C0F", bg:"#ECFCCB" },
                                          REVISI:  { label:"Revisi",   color:"#D7263D", bg:"#F8D6DA" },
                                          TERKIRIM:{ label:"Menunggu", color:"#5E0000", bg:"#EBC4C4" },
                                        };
                                        const cfg = statusCfg[s.status];
                                        return (
                                          <div key={s.id} className="px-4 py-3 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                              style={{background:"#5E0000"}}>
                                              {(s.siswa?.user?.nama || s.siswa?.nama)?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                                                {s.siswa?.user?.nama || s.siswa?.nama}
                                              </p>
                                              <p className="text-[10px] text-slate-400">{s.fileName}</p>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0"
                                              style={{color:cfg.color, backgroundColor:cfg.bg}}>{cfg.label}</span>
                                            <a href={s.fileUrl.startsWith("http") ? s.fileUrl : `http://localhost:3001${s.fileUrl}`}
                                              target="_blank" rel="noopener noreferrer"
                                              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0"
                                              style={{color:"#4285F4", backgroundColor:"#E3ECFF"}}>
                                              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current shrink-0"><path d="M6.18 15L3.12 9.72 9.24 0h5.51L8.63 9.72 6.18 15zm5.82 0H7.76l2.45-4.28h7.13L14.89 15h-2.89zM12 7.5l2.89-5h2.89L21 7.5h-5.78L12 7.5zM20.88 15l-2.45-4.28h2.01L24 15h-3.12z"/></svg>
                                              GDrive
                                            </a>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
          )})()}

        </div>
      </div>

      <TambahSoalModal open={openTambahSoal} onClose={() => setOpenTambahSoal(false)} onUpload={uploadSoal} tahapanList={tahapanList} />
    </div>
  );
}
