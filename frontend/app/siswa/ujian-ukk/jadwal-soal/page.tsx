"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  CalendarDays, FileText, Send, BookOpen, Loader2,
  ChevronLeft, ChevronRight, X, Download, Upload,
  MapPin, Clock, User, CheckCircle, AlertCircle, Link2, ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/shared/ToastSystem";
import { todayJakarta } from "@/components/absensi-harian/shared";

const SoalPdfViewer = dynamic(() => import("./SoalPdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-[#FF5B19]" />
    </div>
  ),
});

interface Soal { id: string; judul: string; deskripsi?: string; fileUrl: string; fileName: string; }
interface Tahapan { id: string; hariKe: number; judul: string; tanggal: string; jamMulai: string; jamSelesai: string; lokasi: string; penguji?: string; keterangan?: string; soal: Soal[]; }
interface MySubmisi { id: string; fileUrl: string; fileName: string; catatan?: string; pesanRevisi?: string; status: "TERKIRIM"|"DITERIMA"|"REVISI"; submittedAt: string; soal: { id: string; judul: string }; }
interface DiskusiItem { id: string; konten: string; createdAt: string; user: { id: string; nama: string; role: string }; replies: DiskusiItem[]; }

function formatTgl(s: string) { return new Date(s).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric" }); }

function statusInfo(s: "TERKIRIM"|"DITERIMA"|"REVISI") {
  if (s === "DITERIMA") return { bg:"#E1EDEE", color:"#6E9CA0", label:"Diterima",      icon: <CheckCircle size={10}/> };
  if (s === "REVISI")   return { bg:"#FFEDD5", color:"#FF5B19", label:"Perlu Revisi",  icon: <AlertCircle size={10}/> };
  return                       { bg:"#E8E7E4", color:"#3D3D3D", label:"Menunggu Review", icon: <Clock size={10}/> };
}

const ROW_PALETTES = [
  { bg:"#E1EDEE", text:"#4F7377",  bar:"#4F7377",  gradient:"linear-gradient(135deg,#4F7377,#6E9CA0)" },
  { bg:"#F2F0E4", text:"#9C9776",  bar:"#9C9776",  gradient:"linear-gradient(135deg,#9C9776,#C4C0A0)" },
  { bg:"#E8E7E4", text:"#3D3D3D",  bar:"#3D3D3D",  gradient:"linear-gradient(135deg,#161616,#3D3D3D)" },
  { bg:"#FFE8DA", text:"#FF5B19",  bar:"#FF5B19",  gradient:"linear-gradient(135deg,#FF5B19,#FF8A54)" },
  { bg:"#ECEBE8", text:"#6E6E6E",  bar:"#6E6E6E",  gradient:"linear-gradient(135deg,#3D3D3D,#6E6E6E)" },
];
function rowPalette(i: number) { return ROW_PALETTES[i % ROW_PALETTES.length]; }

const BUBBLE_COLORS = [
  { bubble:"#E8E7E4", text:"#3D3D3D", avatar:"linear-gradient(135deg,#161616,#3D3D3D)" },
  { bubble:"#E1EDEE", text:"#4F7377", avatar:"linear-gradient(135deg,#4F7377,#6E9CA0)" },
  { bubble:"#FFE8DA", text:"#FF5B19", avatar:"linear-gradient(135deg,#FF5B19,#FF8A54)" },
  { bubble:"#F2F0E4", text:"#9C9776", avatar:"linear-gradient(135deg,#9C9776,#C4C0A0)" },
  { bubble:"#ECEBE8", text:"#6E6E6E", avatar:"linear-gradient(135deg,#3D3D3D,#6E6E6E)" },
];
function bubbleFor(id: string) { let h=0; for(const c of id) h=(h*31+c.charCodeAt(0))>>>0; return BUBBLE_COLORS[h % BUBBLE_COLORS.length]; }

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
              style={{background:"linear-gradient(135deg,#6E9CA0 0%,#4F7377 100%)"}}>
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
                <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
                  <X size={15}/>
                </button>
              </div>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div className="flex items-start gap-3 bg-[#F2F8F8] dark:bg-[#283C3D]/20 rounded-xl p-3.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:"#4285F4"}}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M6.18 15L3.12 9.72 9.24 0h5.51L8.63 9.72 6.18 15zm5.82 0H7.76l2.45-4.28h7.13L14.89 15h-2.89zM12 7.5l2.89-5h2.89L21 7.5h-5.78L12 7.5zM20.88 15l-2.45-4.28h2.01L24 15h-3.12z"/></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4F7377] dark:text-[#AECACD]">Pastikan file sudah dishare</p>
                  <p className="text-[11px] text-[#6E9CA0] dark:text-[#8FB4B7] mt-0.5">Set sharing Google Drive ke "Anyone with the link can view" sebelum kirim link.</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">
                  Link Google Drive <span className="text-[#6E6E6E]">*</span>
                </label>
                <div className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 transition-colors ${urlError ? "border-[#8C8C8C] bg-[#F5F5F4] dark:bg-[#161616]/10" : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus-within:border-[#8FB4B7]"}`}>
                  <Link2 size={15} className="text-slate-400 shrink-0"/>
                  <input
                    type="url"
                    value={driveUrl}
                    onChange={e=>{ setDriveUrl(e.target.value); setUrlError(""); }}
                    placeholder="https://drive.google.com/file/d/..."
                    className="flex-1 text-sm bg-transparent text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400"
                  />
                  {driveUrl && isValidDriveUrl(driveUrl) && (
                    <CheckCircle size={15} className="text-[#6E9CA0] shrink-0"/>
                  )}
                </div>
                {urlError && <p className="mt-1 text-[11px] text-[#6E6E6E]">{urlError}</p>}
              </div>

              {driveUrl && isValidDriveUrl(driveUrl) && (
                <a href={driveUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-semibold text-[#5C868A] hover:text-[#4F7377]">
                  <ExternalLink size={12}/> Cek link (buka di tab baru)
                </a>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Catatan (opsional)</label>
                <textarea value={catatan} onChange={e=>setCatatan(e.target.value)} rows={2}
                  placeholder="Tambahkan keterangan jika diperlukan..."
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none resize-none focus:border-[#8FB4B7] placeholder:text-slate-400"/>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Batal
                </button>
                <button type="submit" disabled={saving || !driveUrl.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{background:"linear-gradient(135deg,#6E9CA0,#4F7377)"}}>
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

function DiskusiActivity({ currentUserId }: { currentUserId: string }) {
  const [list, setList] = useState<DiskusiItem[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; nama: string } | null>(null);
  const [sending, setSending] = useState(false);
  const toast = useToast();
  const load = useCallback(async () => { const r = await fetch("/api/ujian-ukk/diskusi"); if (r.ok) setList(await r.json()); }, []);
  useEffect(() => { load(); }, [load]);

  async function send() {
    if (!input.trim()) return;
    setSending(true);
    const body: Record<string,string> = { konten: input.trim() };
    if (replyTo) body.parentId = replyTo.id;
    const r = await fetch("/api/ujian-ukk/diskusi", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
    setSending(false);
    if (r.ok) { setInput(""); setReplyTo(null); load(); } else toast.error("Gagal mengirim","");
  }
  async function hapus(id: string) { await fetch(`/api/ujian-ukk/diskusi/${id}`, { method:"DELETE" }); load(); }

  const ROLE_LABELS: Record<string,string> = { ADMIN:"Admin", GURU:"Guru", SISWA:"Siswa" };

  return (
    <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden" style={{minHeight:420}}>
      <div className="relative px-5 py-4 overflow-hidden shrink-0"
        style={{background:"linear-gradient(135deg,#3D3D3D 0%,#3D3D3D 50%,#3D3D3D 100%)"}}>
        <div className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10"/>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Send size={14} className="text-white"/>
            </div>
            <h3 className="text-sm font-extrabold text-white">Diskusi UKK</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white/90">
            {list.flatMap(d=>[d,...d.replies]).length} pesan
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {list.flatMap(d=>[d,...d.replies]).length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Send size={24} className="text-slate-200 mb-2"/>
            <p className="text-xs text-slate-400">Belum ada diskusi.</p>
          </div>
        )}
        {list.flatMap(d=>[{...d,isReply:false},...d.replies.map(r=>({...r,isReply:true}))]).map((d) => {
          const bc = bubbleFor(d.user.id);
          return (
            <div key={d.id} className={`flex gap-2.5 ${d.isReply?"pl-6":""}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{background:bc.avatar}}>{d.user.nama[0].toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{d.user.nama}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{background:bc.avatar}}>{ROLE_LABELS[d.user.role]??d.user.role}</span>
                </div>
                <div className="rounded-2xl rounded-tl-none px-3 py-2" style={{backgroundColor:bc.bubble}}>
                  <p className="text-xs leading-relaxed" style={{color:bc.text}}>{d.konten}</p>
                </div>
                <div className="flex gap-2 mt-1">
                  <button onClick={()=>setReplyTo({id:d.id,nama:d.user.nama})} className="text-[10px] text-slate-400 hover:text-[#6E6E6E]">Balas</button>
                  {d.user.id === currentUserId && <button onClick={()=>hapus(d.id)} className="text-[10px] text-slate-400 hover:text-[#6E6E6E]">Hapus</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="shrink-0 px-4 py-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
        {replyTo && (
          <div className="flex items-center gap-2 text-xs bg-[#F5F5F4] dark:bg-[#161616]/20 text-[#545454] px-3 py-1.5 rounded-lg">
            Balas ke <strong>{replyTo.nama}</strong>
            <button onClick={()=>setReplyTo(null)} className="ml-auto"><X size={11}/></button>
          </div>
        )}
        <div className="flex gap-2">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
            placeholder="Tulis pesan..." className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-[#8C8C8C]"/>
          <button onClick={send} disabled={sending||!input.trim()}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-white shrink-0 disabled:opacity-50"
            style={{background:"linear-gradient(135deg,#3D3D3D,#3D3D3D)"}}>
            <Send size={13}/>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SiswaJadwalSoalPage() {
  const [tahapanList, setTahapanList] = useState<Tahapan[]>([]); 
  const [filePool,    setFilePool]    = useState<Tahapan | null>(null); 
  const [mySubmisi,   setMySubmisi]   = useState<MySubmisi[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [tab,          setTab]         = useState<"active"|"completed"|"all">("all");
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
  const shown      = tab === "all" ? tahapanList : tab === "active" ? active : completed;
  const jadwalFiles = (filePool?.soal ?? []).filter(s => s.deskripsi?.startsWith("__jadwal__:"));
  const soalFiles   = (filePool?.soal ?? []).filter(s => !s.deskripsi?.startsWith("__jadwal__:"));
  const totalSoal   = soalFiles.length;
  const submisiMap = new Map(mySubmisi.filter(s=>s.soal?.id).map(s=>[s.soal.id, s]));
  const diterima   = mySubmisi.filter(s=>s.status==="DITERIMA").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col xl:flex-row gap-6">

        <div className="flex-1 min-w-0 space-y-6">

          <div className="relative overflow-hidden rounded-2xl p-6"
            style={{background:"linear-gradient(160deg,#FF5B19 0%,#FF5B19 45%,#FF5B19 72%,#FF5B19 100%)"}}>
            <div className="pointer-events-none absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/10"/>
            <div className="pointer-events-none absolute -bottom-8 right-32 w-36 h-36 rounded-full bg-white/8"/>
            <div className="pointer-events-none absolute bottom-4 -left-6 w-24 h-24 rounded-full bg-white/6"/>
            <div className="relative flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-lg">
                  <FileText size={26} className="text-white"/>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase">Ujian Kompetensi Keahlian</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white/90">Siswa</span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-white leading-tight">Jadwal dan Soal</h1>
                  <p className="text-sm text-white/70 mt-0.5">Lihat jadwal, download soal, dan kirim project</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {[
                  { icon: CalendarDays,  label:"Task",  val: tahapanList.length },
                  { icon: FileText,      label:"Soal",     val: totalSoal },
                  { icon: Upload,        label:"Terkirim", val: mySubmisi.length },
                  { icon: CheckCircle,   label:"Diterima", val: diterima },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex flex-col items-center px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm min-w-16">
                    <Icon size={14} className="text-white/70 mb-1"/>
                    <p className="text-xl font-extrabold text-white leading-none">{val}</p>
                    <p className="text-[10px] text-white/60 font-semibold mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
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
                      style={{background:"linear-gradient(135deg,#FF5B19,#FF5B19)"}}>
                      <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none"/>
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <CalendarDays size={22} className="text-white"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white/95">Jadwal UKK</span>
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
                        <FileText size={30} className="text-[#FFA372]"/>
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
                      style={{background:"linear-gradient(135deg,#3D3D3D,#161616)"}}>
                      <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none"/>
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <FileText size={22} className="text-white"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white/95">Soal UKK</span>
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
                        <FileText size={30} className="text-[#B0B0B0]"/>
                        <p className="font-bold text-slate-700 dark:text-slate-200">Belum ada soal</p>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          <div className="flex flex-col lg:flex-row gap-4 items-stretch">

            <div className="flex-1 min-w-0 flex flex-col gap-4">

              <div className="flex gap-3">
                <button onClick={()=>{ setSoalJadwalIdx(0); setOpenJadwalModal(true); }}
                  className="flex-1 relative overflow-hidden rounded-2xl text-white text-left focus:outline-none transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] p-4 sm:p-5"
                  style={{background:"linear-gradient(135deg,#FF5B19,#FF5B19)", boxShadow:"0 8px 28px rgba(255,91,25,0.45)"}}>
                  <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none"/>
                  <div className="absolute -right-2 -bottom-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none"/>
                  <div className="relative flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <CalendarDays size={14} className="text-white"/>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold tracking-widest uppercase text-white/60 leading-none mb-0.5">Lihat &amp; Download</p>
                          <p className="text-xs sm:text-sm font-extrabold text-white leading-none truncate">Jadwal UKK</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Download size={11} className="text-white/60 shrink-0"/>
                        <p className="text-[10px] text-white/70 font-medium">Klik untuk unduh PDF</p>
                      </div>
                    </div>
                    <div className="relative text-right shrink-0">
                      <p className="text-4xl sm:text-5xl font-black leading-none">{jadwalFiles.length}</p>
                      <p className="text-[10px] text-white/70 mt-1 font-medium">info</p>
                    </div>
                  </div>
                </button>

                <button onClick={()=>{ setSoalSoalIdx(0); setOpenSoalModal(true); }}
                  className="flex-1 relative overflow-hidden rounded-2xl text-white text-left focus:outline-none transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] p-4 sm:p-5"
                  style={{background:"linear-gradient(135deg,#3D3D3D,#161616)", boxShadow:"0 8px 28px rgba(99,102,241,0.45)"}}>
                  <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none"/>
                  <div className="absolute -right-2 -bottom-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none"/>
                  <div className="relative flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <FileText size={14} className="text-white"/>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold tracking-widest uppercase text-white/60 leading-none mb-0.5">Lihat &amp; Download</p>
                          <p className="text-xs sm:text-sm font-extrabold text-white leading-none truncate">Soal UKK</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Download size={11} className="text-white/60 shrink-0"/>
                        <p className="text-[10px] text-white/70 font-medium">Klik untuk unduh PDF</p>
                      </div>
                    </div>
                    <div className="relative text-right shrink-0">
                      <p className="text-4xl sm:text-5xl font-black leading-none">{totalSoal}</p>
                      <p className="text-[10px] text-white/70 mt-1 font-medium">soal</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex-1 min-w-0 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
              <div className="px-5 pt-5 pb-0" style={{background:"linear-gradient(135deg,rgba(16,185,129,0.06) 0%,rgba(99,102,241,0.06) 50%,rgba(255,91,25,0.06) 100%)"}}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#6E9CA0,#4F7377)"}}>
                    <BookOpen size={14} className="text-white"/>
                  </div>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">My Task</p>
                </div>
                <div className="flex gap-5 border-b border-slate-100 dark:border-slate-700">
                  <button onClick={()=>setTab("all")}
                    className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-all ${tab==="all"?"border-[#6E6E6E]":"text-slate-400 border-transparent hover:text-slate-600"}`}
                    style={tab==="all"?{color:"#3D3D3D"}:{}}>
                    Semua
                    {tab==="all" && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold" style={{backgroundColor:"#3D3D3D"}}>{tahapanList.length}</span>}
                  </button>
                  <button onClick={()=>setTab("active")}
                    className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-all ${tab==="active"?"border-primary":"text-slate-400 border-transparent hover:text-slate-600"}`}
                    style={tab==="active"?{color:"#FF5B19"}:{}}>
                    Active Task
                    {tab==="active" && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold" style={{backgroundColor:"#FF5B19"}}>{active.length}</span>}
                  </button>
                  <button onClick={()=>setTab("completed")}
                    className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-all ${tab==="completed"?"border-[#6E9CA0]":"text-slate-400 border-transparent hover:text-slate-600"}`}
                    style={tab==="completed"?{color:"#6E9CA0"}:{}}>
                    Completed
                    {tab==="completed" && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold" style={{backgroundColor:"#6E9CA0"}}>{completed.length}</span>}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-50 dark:divide-slate-700/30">
                {loading && <div className="px-5 py-10 text-center text-sm text-slate-400">Memuat data...</div>}
                {!loading && shown.length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <CalendarDays size={32} className="mx-auto mb-3 text-slate-200"/>
                    <p className="text-sm text-slate-400">{tab==="active" ? "Tidak ada task aktif" : tab==="completed" ? "Tidak ada task selesai" : "Belum ada task tersedia"}</p>
                  </div>
                )}
                {shown.map((t, idx) => {
                  const rp        = rowPalette(idx);
                  const globalSoal = soalFiles[0] ?? null;
                  const myS       = globalSoal ? submisiMap.get(globalSoal.id) : undefined;
                  const isDiterima = myS?.status === "DITERIMA";
                  const isRevisi   = myS?.status === "REVISI";
                  const isTerkirim = myS?.status === "TERKIRIM";
                  const pct        = myS ? 100 : 0;

                  const btn = isDiterima
                    ? { label:"Diterima", icon:<CheckCircle size={11}/>, bg:"#E1EDEE", clr:"#6E9CA0", border:"#6E9CA0", onClick:()=>setDetailTarget(myS!) }
                    : isRevisi
                    ? { label:"Revisi", icon:<AlertCircle size={11}/>, bg:"#FF5B19", clr:"#FF5B19", border:"#FF5B19", onClick:()=>setRevisiModal(myS!) }
                    : isTerkirim
                    ? { label:"Terkirim", icon:<CheckCircle size={11}/>, bg:"#E8E7E4", clr:"#3D3D3D", border:"#3D3D3D", onClick:()=>setDetailTarget(myS!) }
                    : { label:"Kirim", icon:<Send size={11}/>, bg:"#E1EDEE", clr:"#6E9CA0", border:"#6E9CA0", onClick:()=>globalSoal && setSubmitSoal(globalSoal) };

                  return (
                    <motion.div key={t.id} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:idx*0.05}}>
                      <div className="px-5 py-4 flex items-center gap-4 border-l-4 transition-all hover:bg-slate-50/80 dark:hover:bg-slate-700/20"
                        style={{borderLeftColor: isRevisi ? "#FF5B19" : isDiterima ? "#6E9CA0" : rp.bar}}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                          style={{background: rp.gradient}}>
                          <span className="text-sm font-bold text-white">{idx+1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">{t.judul}</p>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg" style={{backgroundColor:"#E1EDEE",color:"#4F7377"}}>
                              <CalendarDays size={10}/>{formatTgl(t.tanggal)}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg" style={{backgroundColor:"#E1EDEE",color:"#4F7377"}}>
                              <Clock size={10}/>{t.jamMulai}–{t.jamSelesai}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg" style={{backgroundColor:"#FF5B19",color:"#FF5B19"}}>
                              <MapPin size={10}/>{t.lokasi}
                            </span>
                            {t.penguji && (
                              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg" style={{backgroundColor:"#E8E7E4",color:"#161616"}}>
                                <User size={10}/>{t.penguji}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-28 shrink-0 hidden sm:block">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-400">Progress</span>
                            <span className="text-[10px] font-bold" style={{color: isDiterima?"#6E9CA0":isRevisi?"#FF5B19":rp.bar}}>{pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{width:`${pct}%`, background: isDiterima?"linear-gradient(90deg,#6E9CA0,#4F7377)":isRevisi?"linear-gradient(90deg,#FF5B19,#FF5B19)":rp.gradient}}/>
                          </div>
                        </div>
                        <button onClick={btn.onClick}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border shrink-0 transition-all hover:brightness-95"
                          style={{borderColor:btn.border, color:btn.clr, backgroundColor:btn.bg}}>
                          {btn.icon}{btn.label}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            </div>

            <div className="w-full lg:w-80 shrink-0">
              <DiskusiActivity currentUserId=""/>
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
                  ? "linear-gradient(135deg,#6E9CA0,#4F7377)"
                  : "linear-gradient(135deg,#3D3D3D,#161616)"}}>
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
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F2F8F8] dark:bg-[#6E9CA0]/10 border border-[#E1EDEE] dark:border-[#6E9CA0]/20">
                    <CheckCircle size={18} className="text-[#6E9CA0] shrink-0"/>
                    <p className="text-sm font-bold text-[#4F7377] dark:text-[#8FB4B7]">Project kamu telah diterima! UKK selesai.</p>
                  </div>
                )}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-500">Status</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{backgroundColor: detailTarget.status==="DITERIMA"?"#E1EDEE":"#E8E7E4",
                              color: detailTarget.status==="DITERIMA"?"#6E9CA0":"#3D3D3D"}}>
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
                  style={{background:"linear-gradient(135deg,#4285F4,#1A73E8)"}}>
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
                style={{background:"linear-gradient(135deg,#FF5B19,#FF5B19)"}}>
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
                <div className="rounded-xl border border-[#FFC7A5] dark:border-[#FF5B19]/30 bg-[#FFF3EC] dark:bg-[#FF5B19]/10 px-4 py-4">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle size={15} className="text-[#FF5B19] mt-0.5 shrink-0"/>
                    <div>
                      <p className="text-xs font-bold text-[#CC4913] dark:text-[#FF7D47] mb-1.5">Catatan dari Penguji</p>
                      <p className="text-sm text-[#A63B10] dark:text-[#FFA372] leading-relaxed whitespace-pre-line">
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
                  style={{background:"linear-gradient(135deg,#FF5B19,#FF5B19)"}}>
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
