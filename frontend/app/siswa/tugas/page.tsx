"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Send } from "lucide-react";
import { useToast } from "@/components/shared/ToastSystem";
import { TugasListCardSiswa } from "@/components/tugas/TugasListCardSiswa";
import { SubmitTugasModal } from "@/components/tugas/SubmitTugasModal";
import { SubmisiSayaModal } from "@/components/tugas/SubmisiSayaModal";
import { isTugasActive } from "@/components/tugas/types";
import type { TugasItem, TugasSubmisiItem } from "@/components/tugas/types";

export default function SiswaTugasPage() {
  const toast = useToast();
  const [tugasList, setTugasList] = useState<TugasItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [submitTarget, setSubmitTarget] = useState<TugasItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<{ s: TugasSubmisiItem; t: TugasItem } | null>(null);
  const [currentUserNama, setCurrentUserNama] = useState<string>("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setCurrentUserNama(d?.nama ?? "")).catch(() => {});
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const t = await fetch("/api/tugas").then((r) => r.json());
      setTugasList(Array.isArray(t) ? t : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function doSubmit(fd: FormData) {
    const res = await fetch("/api/tugas/submisi", { method: "POST", body: fd });
    if (res.ok) {
      const submisi: TugasSubmisiItem = await res.json();
      const tugas = submitTarget;
      if (tugas?.tipe === "PILIHAN_GANDA" && typeof submisi.nilai === "number") {
        toast.success(`Nilai kamu: ${submisi.nilai}`, submisi.nilai === 100 ? "Semua jawaban benar!" : "Tugas berhasil dikumpulkan dan langsung dinilai.");
        setSubmitTarget(null);
        setDetailTarget({ s: submisi, t: tugas });
      } else {
        toast.success("Tugas berhasil dikumpulkan!", "Guru/Admin akan mereview tugasmu.");
        setSubmitTarget(null);
      }
      loadAll();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error("Gagal mengumpulkan", d.message ?? "Coba lagi");
    }
  }

  const active = tugasList.filter((t) => isTugasActive(t));
  const diterimaCount = tugasList.filter((t) => t.submisi?.[0]?.status === "DITERIMA").length;

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-primary p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 right-32 h-36 w-36 rounded-full bg-white/8" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
              <ClipboardList size={26} className="text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Belajar & Praktik</span>
              <h1 className="text-2xl font-extrabold leading-tight text-white">Tugas</h1>
              <p className="mt-0.5 text-sm text-white/70">Kerjakan dan kumpulkan tugas dari gurumu</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {[
              { icon: ClipboardList, label: "Tugas Aktif", val: active.length },
              { icon: Send, label: "Diterima", val: diterimaCount },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex flex-col items-center px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm min-w-15">
                <Icon size={13} className="text-white/70 mb-1" />
                <p className="text-xl font-extrabold text-white leading-none">{loading ? "—" : val}</p>
                <p className="text-[10px] text-white/60 font-semibold mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TugasListCardSiswa
        tugasList={tugasList}
        loading={loading}
        onKumpulkan={(t) => setSubmitTarget(t)}
        onLihatDetail={(s, t) => setDetailTarget({ s, t })}
      />

      <SubmitTugasModal tugas={submitTarget} onClose={() => setSubmitTarget(null)} onSubmit={doSubmit} currentUserNama={currentUserNama} />

      <SubmisiSayaModal
        target={detailTarget?.s ?? null}
        judul={detailTarget?.t.judul}
        tipe={detailTarget?.t.tipe}
        onClose={() => setDetailTarget(null)}
        onKirimUlang={() => {
          const t = detailTarget?.t;
          setDetailTarget(null);
          if (t) setSubmitTarget(t);
        }}
      />
    </div>
  );
}
