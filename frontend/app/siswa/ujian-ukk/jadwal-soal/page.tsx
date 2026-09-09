"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  CalendarDays, FileText, Send, BookOpen, Loader2,
  ChevronLeft, ChevronRight, X, Search,
  Clock, CheckCircle, AlertCircle, Link2, ExternalLink, MapPin,
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
interface MySubmisi { id: string; fileUrl: string; fileName: string; catatan?: string; pesanRevisi?: string; status: "TERKIRIM"|"DITERIMA"|"REVISI"; submittedAt: string; soal: { id: string; judul: string }; }

function formatTgl(s: string) { return new Date(s).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" }); }

function statusInfo(s: "TERKIRIM"|"DITERIMA"|"REVISI") {
  if (s === "DITERIMA") return { bg:"#ECFCCB", color:"#4D7C0F", label:"Diterima",      icon: <CheckCircle size={10}/> };
  if (s === "REVISI")   return { bg:"#F8D6DA", color:"#D7263D", label:"Perlu Revisi",  icon: <AlertCircle size={10}/> };
  return                       { bg:"#EBC4C4", color:"#5E0000", label:"Menunggu Review", icon: <Clock size={10}/> };
}

const ROW_PALETTES = [
  { bg:"#F8D6DA", text:"#D7263D",  bar:"#D7263D",  gradient:"#D7263D" },
  { bg:"#E3ECFF", text:"#2962FF",  bar:"#2962FF",  gradient:"#2962FF" },
  { bg:"#FFE3D2", text:"#FF5722",  bar:"#FF5722",  gradient:"#FF5722" },
  { bg:"#ECFCCB", text:"#4D7C0F",  bar:"#4D7C0F",  gradient:"#C3F84A" },
  { bg:"#E3ECFF", text:"#1745B0",  bar:"#1745B0",  gradient:"#1745B0" },
];
function rowPalette(i: number) { return ROW_PALETTES[i % ROW_PALETTES.length]; }

function isValidDriveUrl(url: string) {
  return url.startsWith("https://drive.google.com/") || url.startsWith("https://docs.google.com/");
}

function SubmitModal({ open, onClose, soal, onSubmit }: {
  open: boolean; onClose: () => void; soal: Soal | null; onSubmit: (fd: FormData) => Promise<void>;
}) {
  const [driveUrl, setDriveUrl] = useState("");
  const [catatan, setCatatan]   = useState("");
  const [saving, setSaving]     = useState(false);
  const [urlError, setUrlError] = useState("");
  useEffect(() => { if (open) { setDriveUrl(""); setCatatan(""); setUrlError(""); } }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!soal) return;
    if (!driveUrl.trim()) { setUrlError("Link Google Drive wajib diisi"); return; }
    if (!isValidDriveUrl(driveUrl.trim())) { setUrlError("Link harus dari Google Drive (drive.google.com atau docs.google.com)"); return; }
    setSaving(true);
    const fd = new FormData();
    fd.append("soalId", soal.id);
    fd.append("driveUrl", driveUrl.trim());
    if (catatan.trim()) fd.append("catatan", catatan.trim());
    await onSubmit(fd);
    setSaving(false);
  }
  if (!soal) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}>
          <motion.div initial={{scale:0.95,opacity:0,y:16}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.95,opacity:0,y:16}}
            transition={{type:"spring",damping:26,stiffness:340}}
            className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={e=>e.stopPropagation()}>
            <div className="relative px-6 py-5 overflow-hidden"
              style={{background:"#2962FF"}}>
              <div className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10"/>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Link2 size={18} className="text-white"/>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Kirim Project</p>
                    <p className="text-base font-extrabold text-white leading-tight line-clamp-1">{soal.judul}</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25">
                  <X size={15}/>
                </button>
              </div>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div className="flex items-start gap-3 bg-[#EEF3FF] dark:bg-[#1745B0]/20 rounded-xl p-3.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:"#4285F4"}}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M6.18 15L3.12 9.72 9.24 0h5.51L8.63 9.72 6.18 15zm5.82 0H7.76l2.45-4.28h7.13L14.89 15h-2.89zM12 7.5l2.89-5h2.89L21 7.5h-5.78L12 7.5zM20.88 15l-2.45-4.28h2.01L24 15h-3.12z"/></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1745B0] dark:text-[#93B4FF]">Pastikan file sudah dishare</p>
                  <p className="text-[11px] text-[#1745b0] dark:text-[#6B93FF] mt-0.5">Set sharing Google Drive ke "Anyone with the link can view" sebelum kirim link.</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">
                  Link Google Drive <span className="text-[#8B0000]">*</span>
                </label>
                <div className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 transition-colors ${urlError ? "border-[#A62E2E] bg-[#F7E8E8] dark:bg-[#300000]/10" : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus-within:border-[#6B93FF]"}`}>
                  <Link2 size={15} className="text-slate-400 shrink-0"/>
                  <input
                    type="url"
                    value={driveUrl}
                    onChange={e=>{ setDriveUrl(e.target.value); setUrlError(""); }}
                    placeholder="https://drive.google.com/file/d/..."
                    className="flex-1 text-sm bg-transparent text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400"
                  />
                  {driveUrl && isValidDriveUrl(driveUrl) && (
                    <CheckCircle size={15} className="text-[#1745B0] shrink-0"/>
                  )}
                </div>
                {urlError && <p className="mt-1 text-[11px] text-[#8B0000]">{urlError}</p>}
              </div>

              {driveUrl && isValidDriveUrl(driveUrl) && (
                <a href={driveUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-semibold text-[#1745B0] hover:text-[#1745B0]">
                  <ExternalLink size={12}/> Cek link (buka di tab baru)
                </a>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Catatan (opsional)</label>
                <textarea value={catatan} onChange={e=>setCatatan(e.target.value)} rows={2}
                  placeholder="Tambahkan keterangan jika diperlukan..."
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none resize-none focus:border-[#6B93FF] placeholder:text-slate-400"/>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Batal
                </button>
                <button type="submit" disabled={saving || !driveUrl.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{background:"#2962FF"}}>
                  {saving ? <><Loader2 size={14} className="animate-spin"/> Mengirim...</> : <><Send size={14}/> Kirim Project</>}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function SiswaJadwalSoalPage() {
  const router = useRouter();
  const [tahapanList, setTahapanList] = useState<Tahapan[]>([]); 
  const [filePool,    setFilePool]    = useState<Tahapan | null>(null); 
  const [mySubmisi,   setMySubmisi]   = useState<MySubmisi[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [tab,          setTab]         = useState<"active"|"completed"|"all">("all");
  const [taskSearch,   setTaskSearch]  = useState("");
  const [submitSoal,   setSubmitSoal]  = useState<Soal | null>(null);
  const [detailTarget, setDetailTarget] = useState<MySubmisi | null>(null);
  const [revisiModal,  setRevisiModal]  = useState<MySubmisi | null>(null);
  const [openJadwalModal, setOpenJadwalModal] = useState(false);
  const [openSoalModal,   setOpenSoalModal]   = useState(false);
  const [soalJadwalIdx,   setSoalJadwalIdx]   = useState(0);
  const [soalSoalIdx,     setSoalSoalIdx]     = useState(0);
  const toast = useToast();

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [t, s] = await Promise.all([
      fetch("/api/ujian-ukk/tahapan").then(r => r.json()).catch(() => []),
      fetch("/api/ujian-ukk/submisi/saya").then(r => r.json()).catch(() => []),
    ]);
    const all: Tahapan[]  = Array.isArray(t) ? t : [];
    setFilePool(all.find(x => x.hariKe === 0) ?? null);
    const tasks = all.filter(x => x.hariKe !== 0);
    setTahapanList(tasks.length > 0 ? [tasks[0]] : []);
    setMySubmisi(Array.isArray(s) ? s : []);
    setLoading(false);
    const nowCheck = new Date();
    const todayCheck = todayJakarta();
    const hasActive = tasks.some(tk => {
      const tglStr = tk.tanggal?.slice(0, 10) ?? "";
      if (tglStr > todayCheck) return true;
      if (tglStr < todayCheck) return false;
      const [h, m] = (tk.jamSelesai ?? "23:59").split(":").map(Number);
      const selesai = new Date(); selesai.setHours(h, m, 0, 0);
      return nowCheck < selesai;
    });
    if (!hasActive && tasks.length > 0) setTab("completed");
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  async function doSubmit(fd: FormData) {
    const r = await fetch("/api/ujian-ukk/submisi", { method:"POST", body: fd });
    if (r.ok) { toast.success("Project berhasil dikirim!", "Guru akan mereview pengirimanmu."); setSubmitSoal(null); loadAll(); }
    else toast.error("Gagal mengirim", "Coba lagi");
  }

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
  const completed  = tahapanList.filter(t => !active.includes(t));
  const shown      = (tab === "all" ? tahapanList : tab === "active" ? active : completed)
    .filter((t) => t.judul.toLowerCase().includes(taskSearch.trim().toLowerCase()));
  const jadwalFiles = (filePool?.soal ?? []).filter(s => s.deskripsi?.startsWith("__jadwal__:"));
  const soalFiles   = (filePool?.soal ?? []).filter(s => !s.deskripsi?.startsWith("__jadwal__:"));
  const totalSoal   = soalFiles.length;
  const submisiMap = new Map(mySubmisi.filter(s=>s.soal?.id).map(s=>[s.soal.id, s]));
  const diterima   = mySubmisi.filter(s=>s.status==="DITERIMA").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col xl:flex-row gap-6">

        <div className="flex-1 min-w-0 space-y-6">

          <div className="relative hidden overflow-hidden rounded-2xl bg-primary p-6 lg:block">
            <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10"/>
            <div className="pointer-events-none absolute -bottom-8 right-32 h-36 w-36 rounded-full bg-white/8"/>
            <div className="relative flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg sm:h-14 sm:w-14">
                <FileText size={22} className="text-white sm:hidden"/>
                <FileText size={26} className="text-white hidden sm:block"/>
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase">Ujian Kompetensi Keahlian</span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">Jadwal dan Soal</h1>
              </div>
            </div>
          </div>

          <div className="relative -m-4 lg:hidden" style={{ background: "#D7263D" }}>
            <div className="relative flex items-center px-4 pb-4 pt-4">
              <button type="button" onClick={() => router.push("/siswa/dashboard")}
                className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white active:bg-white/25">
                <ChevronLeft size={18} />
              </button>
              <h1 className="absolute inset-x-0 text-center text-base font-bold text-white">UKK</h1>
            </div>
          </div>

          <AnimatePresence>
            {openJadwalModal && (()=>{
              const allSoal = jadwalFiles;
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
                            className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/30 disabled:opacity-40"><ChevronLeft size={16}/></button>
                          <button onClick={()=>setSoalJadwalIdx(i=>Math.min(allSoal.length-1,i+1))} disabled={soalJadwalIdx===allSoal.length-1}
                            className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/30 disabled:opacity-40"><ChevronRight size={16}/></button>
                        </>)}
                        <button onClick={()=>setOpenJadwalModal(false)}
                          className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/30"><X size={16}/></button>
                      </div>
                    </div>
                    {curSoal ? <SoalPdfViewer soal={curSoal} onClose={()=>setOpenJadwalModal(false)}/> : (
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
              const allSoal = soalFiles;
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
                      style={{background:"#5E0000"}}>
                      <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none"/>
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <FileText size={22} className="text-white"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="rounded-lg bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white/95">Soal UKK</span>
                        <h2 className="mt-1 text-lg font-extrabold text-white leading-snug line-clamp-2">
                          {curSoal ? curSoal.judul : "Soal UKK"}
                        </h2>
                        <p className="mt-0.5 text-[11px] text-white/70">{curSoal?.fileName ?? `${totalSoal} soal tersedia`}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {allSoal.length > 1 && (<>
                          <button onClick={()=>setSoalSoalIdx(i=>Math.max(0,i-1))} disabled={soalSoalIdx===0}
                            className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/30 disabled:opacity-40"><ChevronLeft size={16}/></button>
                          <button onClick={()=>setSoalSoalIdx(i=>Math.min(allSoal.length-1,i+1))} disabled={soalSoalIdx===allSoal.length-1}
                            className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/30 disabled:opacity-40"><ChevronRight size={16}/></button>
                        </>)}
                        <button onClick={()=>setOpenSoalModal(false)}
                          className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/30"><X size={16}/></button>
                      </div>
                    </div>
                    {curSoal ? <SoalPdfViewer soal={curSoal} onClose={()=>setOpenSoalModal(false)}/> : (
                      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                        <FileText size={30} className="text-[#C25858]"/>
                        <p className="font-bold text-slate-700 dark:text-slate-200">Belum ada soal</p>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          <div className="mb-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_2.3fr]">
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800 lg:col-start-1 lg:row-start-1">
              <p className="mb-4 text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Kategori</p>
              <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-col lg:gap-4">
                <button type="button" onClick={()=>{ setSoalJadwalIdx(0); setOpenJadwalModal(true); }}
                  className="relative flex h-24 flex-col justify-between overflow-hidden rounded-xl px-3 py-3 text-left text-white transition-all hover:scale-[1.01] active:scale-[0.99] sm:rounded-2xl lg:h-40 lg:px-5 lg:py-5"
                  style={{ background: "#D7263D", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
                  <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 lg:-right-6 lg:-top-6 lg:h-28 lg:w-28" />
                  <div className="pointer-events-none absolute -bottom-4 right-12 hidden h-20 w-20 rounded-full bg-white/8 lg:block" />

                  <div className="relative flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 lg:hidden">
                    <CalendarDays size={14} />
                  </div>
                  <div className="relative min-w-0 lg:hidden">
                    <p className="truncate text-sm font-black leading-tight">Jadwal<span className="text-white/70"> UKK</span></p>
                    <p className="mt-0.5 truncate text-[9px] font-medium text-white/75">{jadwalFiles.length} file jadwal</p>
                  </div>

                  <div className="relative hidden items-start justify-between lg:flex">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                      <CalendarDays size={15} />
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/60">Kategori</p>
                      <p className="text-lg font-black leading-tight">Jadwal<span className="text-white/70"> UKK</span></p>
                    </div>
                  </div>

                  <div className="relative hidden items-baseline gap-2 lg:flex">
                    <span className="text-5xl font-black leading-none tabular-nums">{jadwalFiles.length}</span>
                    <span className="text-[11px] font-semibold uppercase leading-tight tracking-wide text-white/70">file<br />jadwal</span>
                  </div>

                  <div className="relative hidden items-end justify-between pt-2 lg:flex">
                    <div>
                      <p className="text-[8px] font-medium uppercase tracking-wider text-white/60">TA</p>
                      <p className="text-base font-black leading-none">2026/2027</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-medium uppercase tracking-wider text-white/60">Status</p>
                      <p className="text-[10px] font-semibold">Aktif</p>
                    </div>
                  </div>
                </button>

                <button type="button" onClick={()=>{ setSoalSoalIdx(0); setOpenSoalModal(true); }}
                  className="relative flex h-24 flex-col justify-between overflow-hidden rounded-xl px-3 py-3 text-left text-white transition-all hover:scale-[1.01] active:scale-[0.99] sm:rounded-2xl lg:h-40 lg:px-5 lg:py-5"
                  style={{ background: "#8B0000", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
                  <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 lg:-right-6 lg:-top-6 lg:h-28 lg:w-28" />
                  <div className="pointer-events-none absolute -bottom-4 right-12 hidden h-20 w-20 rounded-full bg-white/8 lg:block" />

                  <div className="relative flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 lg:hidden">
                    <FileText size={14} />
                  </div>
                  <div className="relative min-w-0 lg:hidden">
                    <p className="truncate text-sm font-black leading-tight">Soal<span className="text-white/70"> UKK</span></p>
                    <p className="mt-0.5 truncate text-[9px] font-medium text-white/75">{totalSoal} soal tersedia</p>
                  </div>

                  <div className="relative hidden items-start justify-between lg:flex">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                      <FileText size={15} />
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/60">Kategori</p>
                      <p className="text-lg font-black leading-tight">Soal<span className="text-white/70"> UKK</span></p>
                    </div>
                  </div>

                  <div className="relative hidden items-baseline gap-2 lg:flex">
                    <span className="text-5xl font-black leading-none tabular-nums">{totalSoal}</span>
                    <span className="text-[11px] font-semibold uppercase leading-tight tracking-wide text-white/70">soal<br />tersedia</span>
                  </div>

                  <div className="relative hidden items-end justify-between pt-2 lg:flex">
                    <div>
                      <p className="text-[8px] font-medium uppercase tracking-wider text-white/60">TA</p>
                      <p className="text-base font-black leading-none">2026/2027</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-medium uppercase tracking-wider text-white/60">Status</p>
                      <p className="text-[10px] font-semibold">{diterima > 0 ? "Diterima" : "Berjalan"}</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="hidden flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden lg:flex">
              <div className="px-5 pt-5 pb-0" style={{background:"rgba(215,38,61,0.05)"}}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"#D7263D"}}>
                    <BookOpen size={14} className="text-white"/>
                  </div>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">My Task</p>
                </div>
                <div className="relative mb-3">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" />
                  <input value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)}
                    placeholder="Cari nama task..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200" />
                </div>
                <div className="flex gap-5 border-b border-slate-100 dark:border-slate-700">
                  <button onClick={()=>setTab("all")}
                    className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-all ${tab==="all"?"border-slate-500":"text-slate-400 border-transparent hover:text-slate-600"}`}
                    style={tab==="all"?{color:"#64748B"}:{}}>
                    Semua
                    {tab==="all" && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-lg text-white font-bold" style={{backgroundColor:"#64748B"}}>{tahapanList.length}</span>}
                  </button>
                  <button onClick={()=>setTab("active")}
                    className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-all ${tab==="active"?"border-primary":"text-slate-400 border-transparent hover:text-slate-600"}`}
                    style={tab==="active"?{color:"#D7263D"}:{}}>
                    Active Task
                    {tab==="active" && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-lg text-white font-bold" style={{backgroundColor:"#D7263D"}}>{active.length}</span>}
                  </button>
                  <button onClick={()=>setTab("completed")}
                    className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-all ${tab==="completed"?"border-[#4D7C0F]":"text-slate-400 border-transparent hover:text-slate-600"}`}
                    style={tab==="completed"?{color:"#4D7C0F"}:{}}>
                    Completed
                    {tab==="completed" && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-lg text-white font-bold" style={{backgroundColor:"#4D7C0F"}}>{completed.length}</span>}
                  </button>
                </div>
              </div>

              <div className="max-h-[330px] overflow-auto">
                {loading && <div className="px-5 py-10 text-center text-sm text-slate-400">Memuat data...</div>}
                {!loading && shown.length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <CalendarDays size={32} className="mx-auto mb-3 text-slate-200"/>
                    <p className="text-sm text-slate-400">{taskSearch.trim() ? `Tidak ada task dengan nama "${taskSearch.trim()}"` : tab==="active" ? "Tidak ada task aktif" : tab==="completed" ? "Tidak ada task selesai" : "Belum ada task tersedia"}</p>
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
                        <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Progress</th>
                        <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((t, idx) => {
                        const rp        = rowPalette(idx);
                        const globalSoal = soalFiles[0] ?? null;
                        const myS       = globalSoal ? submisiMap.get(globalSoal.id) : undefined;
                        const isDiterima = myS?.status === "DITERIMA";
                        const isRevisi   = myS?.status === "REVISI";
                        const isTerkirim = myS?.status === "TERKIRIM";
                        const pct        = myS ? 100 : 0;
                        const onLime     = rp.gradient === "#C3F84A";

                        const btn = isDiterima
                          ? { label:"Diterima", icon:<CheckCircle size={11}/>, bg:"#ECFCCB", clr:"#4D7C0F", border:"#4D7C0F", onClick:()=>setDetailTarget(myS!) }
                          : isRevisi
                          ? { label:"Revisi", icon:<AlertCircle size={11}/>, bg:"#F8D6DA", clr:"#D7263D", border:"#D7263D", onClick:()=>setRevisiModal(myS!) }
                          : isTerkirim
                          ? { label:"Terkirim", icon:<CheckCircle size={11}/>, bg:"#EBC4C4", clr:"#5E0000", border:"#5E0000", onClick:()=>setDetailTarget(myS!) }
                          : { label:"Kirim", icon:<Send size={11}/>, bg:"#E3ECFF", clr:"#1745B0", border:"#1745B0", onClick:()=>globalSoal && setSubmitSoal(globalSoal) };

                        return (
                          <tr key={t.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-700/40 dark:hover:bg-slate-700/20">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm" style={{background: rp.gradient}}>
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
                                  <div className="h-full rounded-full" style={{width:`${pct}%`, background: isDiterima?"#4D7C0F":isRevisi?"#D7263D":rp.gradient}}/>
                                </div>
                                <span className="text-xs font-bold" style={{color: isDiterima?"#4D7C0F":isRevisi?"#D7263D":rp.bar}}>{pct}%</span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right">
                              <button onClick={btn.onClick}
                                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:brightness-95"
                                style={{borderColor:btn.border, color:btn.clr, backgroundColor:btn.bg}}>
                                {btn.icon}{btn.label}
                              </button>
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

          <div className="relative isolate -mx-4 -mt-4 lg:hidden" style={{ background: "#D7263D" }}>
            <div className="h-6" />
            <div className="space-y-3 rounded-t-[28px] bg-surface px-4 py-3 dark:bg-[#1c2434]">
            <div className="space-y-3 rounded-3xl bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-[#1c2434]">
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" />
                <input value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)}
                  placeholder="Cari nama task..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-200" />
              </div>
              <div className="flex items-center gap-4 border-b border-slate-200 px-1 dark:border-slate-700">
                <button type="button" onClick={()=>setTab("all")}
                  className="-mb-px flex items-center gap-1.5 border-b-2 pb-2.5 text-sm font-bold transition-colors"
                  style={tab==="all"?{borderColor:"#64748B",color:"#64748B"}:{borderColor:"transparent",color:"#94a3b8"}}>
                  Semua
                  <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                    style={tab==="all"?{background:"#64748B18",color:"#64748B"}:{background:"#E2E8F0",color:"#94a3b8"}}>
                    {tahapanList.length}
                  </span>
                </button>
                <button type="button" onClick={()=>setTab("active")}
                  className="-mb-px flex items-center gap-1.5 border-b-2 pb-2.5 text-sm font-bold transition-colors"
                  style={tab==="active"?{borderColor:"#D7263D",color:"#D7263D"}:{borderColor:"transparent",color:"#94a3b8"}}>
                  Aktif
                  <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                    style={tab==="active"?{background:"#D7263D18",color:"#D7263D"}:{background:"#E2E8F0",color:"#94a3b8"}}>
                    {active.length}
                  </span>
                </button>
                <button type="button" onClick={()=>setTab("completed")}
                  className="-mb-px flex items-center gap-1.5 border-b-2 pb-2.5 text-sm font-bold transition-colors"
                  style={tab==="completed"?{borderColor:"#4D7C0F",color:"#4D7C0F"}:{borderColor:"transparent",color:"#94a3b8"}}>
                  Selesai
                  <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                    style={tab==="completed"?{background:"#4D7C0F18",color:"#4D7C0F"}:{background:"#E2E8F0",color:"#94a3b8"}}>
                    {completed.length}
                  </span>
                </button>
              </div>
            </div>

            {loading && (
              <div className="rounded-3xl bg-white py-14 text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:bg-[#1c2434]">
                <p className="text-sm text-slate-400">Memuat data...</p>
              </div>
            )}
            {!loading && shown.length === 0 && (
              <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-14 text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:bg-[#1c2434]">
                <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "#D7263D18" }}>
                  <CalendarDays size={24} style={{ color: "#D7263D" }} />
                </div>
                <p className="mt-4 text-sm text-slate-400">{taskSearch.trim() ? `Tidak ada task dengan nama "${taskSearch.trim()}"` : tab==="active" ? "Tidak ada task aktif" : tab==="completed" ? "Tidak ada task selesai" : "Belum ada task tersedia"}</p>
              </div>
            )}
            {!loading && shown.length > 0 && (
              <div className="space-y-2.5">
                {shown.map((t, idx) => {
                  const accent = idx % 2 === 0;
                  const globalSoal = soalFiles[0] ?? null;
                  const myS       = globalSoal ? submisiMap.get(globalSoal.id) : undefined;
                  const isDiterima = myS?.status === "DITERIMA";
                  const isRevisi   = myS?.status === "REVISI";
                  const isTerkirim = myS?.status === "TERKIRIM";
                  const pct        = myS ? 100 : 0;
                  const barColor   = isDiterima ? "#4D7C0F" : isRevisi ? "#D7263D" : "#D7263D";

                  const btn = isDiterima
                    ? { label:"Diterima", icon:<CheckCircle size={11}/>, bg: accent ? "rgba(255,255,255,0.2)" : "#ECFCCB", clr: accent ? "#fff" : "#4D7C0F", onClick:()=>setDetailTarget(myS!) }
                    : isRevisi
                    ? { label:"Revisi", icon:<AlertCircle size={11}/>, bg: accent ? "rgba(255,255,255,0.2)" : "#F8D6DA", clr: accent ? "#fff" : "#D7263D", onClick:()=>setRevisiModal(myS!) }
                    : isTerkirim
                    ? { label:"Terkirim", icon:<CheckCircle size={11}/>, bg: accent ? "rgba(255,255,255,0.2)" : "#EBC4C4", clr: accent ? "#fff" : "#5E0000", onClick:()=>setDetailTarget(myS!) }
                    : { label:"Kirim", icon:<Send size={11}/>, bg: accent ? "rgba(255,255,255,0.2)" : "#E3ECFF", clr: accent ? "#fff" : "#1745B0", onClick:()=>globalSoal && setSubmitSoal(globalSoal) };

                  return (
                    <motion.div key={t.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.03 }}
                      className={`relative overflow-hidden rounded-[22px] p-4 shadow-[0_4px_14px_-4px_rgba(0,0,0,0.10)] ${accent ? "" : "bg-white dark:bg-[#1c2434]"}`}
                      style={accent ? { backgroundColor: "#D7263D" } : undefined}>
                      {accent && <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10" />}
                      <div className="relative flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold"
                          style={{ backgroundColor: accent ? "rgba(255,255,255,0.2)" : "#D7263D18", color: accent ? "#fff" : "#D7263D" }}>
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-sm font-bold ${accent ? "text-white" : "text-slate-800 dark:text-white"}`}>{t.judul}</p>
                          <div className={`mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-medium ${accent ? "text-white/75" : "text-slate-500 dark:text-slate-400"}`}>
                            <span className="flex items-center gap-1"><CalendarDays size={9} />{formatTgl(t.tanggal)}</span>
                            <span className="flex items-center gap-1"><Clock size={9} />{t.jamMulai}–{t.jamSelesai}</span>
                            <span className="flex items-center gap-1"><MapPin size={9} />{t.lokasi}</span>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-3 flex items-center justify-between gap-2">
                        <div className="flex flex-1 items-center gap-2">
                          <div className="h-1.5 flex-1 max-w-24 overflow-hidden rounded-full" style={{ background: accent ? "rgba(255,255,255,0.25)" : "#F1F5F8" }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent ? "#fff" : barColor }} />
                          </div>
                          <span className={`text-[10px] font-bold ${accent ? "text-white" : ""}`} style={accent ? undefined : { color: barColor }}>{pct}%</span>
                        </div>
                        <button onClick={btn.onClick}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] font-bold transition-all active:scale-95"
                          style={{ backgroundColor: btn.bg, color: btn.clr }}>
                          {btn.icon}{btn.label}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
          </div>

        </div>
      </div>

      <SubmitModal open={!!submitSoal} onClose={()=>setSubmitSoal(null)} soal={submitSoal} onSubmit={doSubmit}/>

      <AnimatePresence>
        {detailTarget && (
          <motion.div key="detail-overlay"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={()=>setDetailTarget(null)}>
            <motion.div initial={{scale:0.95,opacity:0,y:16}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.95,opacity:0,y:16}}
              transition={{type:"spring",damping:26,stiffness:340}}
              className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
              onClick={e=>e.stopPropagation()}>
              <div className="relative px-6 py-5 overflow-hidden"
                style={{background: detailTarget.status==="DITERIMA"
                  ? "#4D7C0F"
                  : "#5E0000"}}>
                <div className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10"/>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <CheckCircle size={18} className="text-white"/>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                        {detailTarget.status==="DITERIMA" ? "Project Diterima ✓" : "Project Terkirim"}
                      </p>
                      <p className="text-base font-extrabold text-white leading-tight">{detailTarget.soal?.judul}</p>
                    </div>
                  </div>
                  <button onClick={()=>setDetailTarget(null)} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
                    <X size={15}/>
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {detailTarget.status==="DITERIMA" && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#ECFCCB] dark:bg-[#4D7C0F]/10 border border-[#C3F84A]/50 dark:border-[#4D7C0F]/30">
                    <CheckCircle size={18} className="text-[#4D7C0F] shrink-0"/>
                    <p className="text-sm font-bold text-[#4D7C0F] dark:text-[#C3F84A]">Project kamu telah diterima! UKK selesai.</p>
                  </div>
                )}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-500">Status</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
                      style={{backgroundColor: detailTarget.status==="DITERIMA"?"#ECFCCB":"#EBC4C4",
                              color: detailTarget.status==="DITERIMA"?"#4D7C0F":"#5E0000"}}>
                      {detailTarget.status==="DITERIMA" ? "Diterima" : "Menunggu Review"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-500">Dikirim pada</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {new Date(detailTarget.submittedAt).toLocaleString("id-ID",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                    </span>
                  </div>
                  {detailTarget.catatan && (
                    <div className="py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-500 mb-1">Catatan kamu</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{detailTarget.catatan}</p>
                    </div>
                  )}
                </div>
                <a href={detailTarget.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{background:"#4285F4"}}>
                  <ExternalLink size={14}/> Buka Google Drive
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {revisiModal && (
          <motion.div key="revisi-siswa-overlay"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={()=>setRevisiModal(null)}>
            <motion.div initial={{scale:0.95,opacity:0,y:16}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.95,opacity:0,y:16}}
              transition={{type:"spring",damping:26,stiffness:340}}
              className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
              onClick={e=>e.stopPropagation()}>
              <div className="relative px-6 py-5 overflow-hidden"
                style={{background:"#D7263D"}}>
                <div className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10"/>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <AlertCircle size={18} className="text-white"/>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Perlu Revisi</p>
                      <p className="text-base font-extrabold text-white leading-tight">{revisiModal.soal?.judul}</p>
                    </div>
                  </div>
                  <button onClick={()=>setRevisiModal(null)} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
                    <X size={15}/>
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="rounded-xl border border-[#F0A3AC] dark:border-[#D7263D]/30 bg-[#FCF0F1] dark:bg-[#D7263D]/10 px-4 py-4">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle size={15} className="text-[#D7263D] mt-0.5 shrink-0"/>
                    <div>
                      <p className="text-xs font-bold text-[#9E1B2E] dark:text-[#E8677A] mb-1.5">Catatan dari Penguji</p>
                      <p className="text-sm text-[#7A1626] dark:text-[#E8828C] leading-relaxed whitespace-pre-line">
                        {revisiModal.pesanRevisi || "Silakan perbaiki project kamu dan kirim ulang."}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-500">Pengiriman sebelumnya</span>
                  <a href={revisiModal.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold"
                    style={{color:"#4285F4"}}>
                    <ExternalLink size={11}/> Lihat GDrive Lama
                  </a>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Perbaiki project kamu sesuai catatan di atas, upload ke Google Drive, lalu kirim ulang link-nya.
                </p>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button onClick={()=>setRevisiModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700">
                  Tutup
                </button>
                <button onClick={()=>{ setRevisiModal(null); soalFiles[0] && setSubmitSoal(soalFiles[0]); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{background:"#D7263D"}}>
                  <Send size={13}/> Kirim Ulang Project
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
