"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Send } from "lucide-react";
import { useToast } from "@/components/shared/ToastSystem";
import { TugasFormModal } from "@/components/tugas/TugasFormModal";
import { TugasListCard } from "@/components/tugas/TugasListCard";
import { SubmisiTugasModal } from "@/components/tugas/SubmisiTugasModal";
import { RevisiFormModal } from "@/components/tugas/RevisiFormModal";
import type { TugasItem, TugasSubmisiItem } from "@/components/tugas/types";

export default function GuruTugasPage() {
  const toast = useToast();
  const [tugasList, setTugasList] = useState<TugasItem[]>([]);
  const [submisiList, setSubmisiList] = useState<TugasSubmisiItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [mapelOptions, setMapelOptions] = useState<string[]>([]);
  const [mapelLoaded, setMapelLoaded] = useState(false);

  const [tugasFormOpen, setTugasFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TugasItem | null>(null);
  const [submisiModalTugas, setSubmisiModalTugas] = useState<TugasItem | null>(null);
  const [revisiTarget, setRevisiTarget] = useState<TugasSubmisiItem | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        fetch("/api/tugas").then((r) => r.json()),
        fetch("/api/tugas/submisi").then((r) => r.json()),
      ]);
      setTugasList(Array.isArray(t) ? t : []);
      setSubmisiList(Array.isArray(s) ? s : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      setCurrentUserId(d?.id ?? "");
      setCurrentUserRole(d?.role ?? "");
    }).catch(() => {});
    fetch("/api/mapel/saya").then((r) => r.json()).then((d) => {
      setMapelOptions(Array.isArray(d) ? d : []);
    }).catch(() => {}).finally(() => setMapelLoaded(true));
  }, []);

  // Selama mapel/saya belum selesai dimuat, jangan tampilkan tombol Tambah
  // dulu — mencegah kedip "boleh tambah" lalu langsung disembunyikan begitu
  // ternyata guru ini tidak diampu mapel apa pun.
  const canCreate = mapelLoaded && mapelOptions.length > 0;

  async function deleteTugas(id: string) {
    if (!await toast.confirm("Hapus tugas ini?", "Semua submisi siswa untuk tugas ini juga akan terhapus.")) return;
    const res = await fetch(`/api/tugas/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Tugas dihapus", ""); loadAll(); }
    else toast.error("Gagal menghapus tugas");
  }

  async function updateStatus(id: string, status: "DITERIMA" | "REVISI", pesanRevisi?: string) {
    const res = await fetch(`/api/tugas/submisi/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...(pesanRevisi ? { pesanRevisi } : {}) }),
    });
    if (res.ok) {
      toast.success(status === "DITERIMA" ? "Tugas diterima!" : "Revisi dikirim ke siswa", "");
      loadAll();
    } else {
      toast.error("Gagal memperbarui status");
    }
  }

  async function kirimRevisi(id: string, pesan: string) {
    await updateStatus(id, "REVISI", pesan);
    setRevisiTarget(null);
  }

  async function simpanNilai(submisiId: string, nilai: number) {
    const res = await fetch(`/api/tugas/submisi/${submisiId}/nilai`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nilai }),
    });
    if (res.ok) {
      toast.success("Nilai disimpan!", `Nilai ${nilai} tersimpan, tugas otomatis ditandai selesai.`);
      loadAll();
    } else {
      toast.error("Gagal menyimpan nilai");
    }
  }

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
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Manajemen Tugas</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold text-white/90">Guru</span>
              </div>
              <h1 className="text-2xl font-extrabold leading-tight text-white">Tugas</h1>
              <p className="mt-0.5 text-sm text-white/70">Kelola tugas dan pantau pengumpulan siswa</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {[
              { icon: ClipboardList, label: "Total Tugas", val: tugasList.length },
              { icon: Send, label: "Total Submisi", val: submisiList.length },
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

      <TugasListCard
        tugasList={tugasList}
        submisiList={submisiList}
        loading={loading}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        canCreate={canCreate}
        onAddTugas={() => { setEditTarget(null); setTugasFormOpen(true); }}
        onEditTugas={(t) => { setEditTarget(t); setTugasFormOpen(true); }}
        onDeleteTugas={deleteTugas}
        onLihatSubmisi={(t) => setSubmisiModalTugas(t)}
      />

      <SubmisiTugasModal
        tugas={submisiModalTugas}
        submisi={submisiList}
        onClose={() => setSubmisiModalTugas(null)}
        onTerima={(id) => updateStatus(id, "DITERIMA")}
        onRevisi={(s) => setRevisiTarget(s)}
        onSimpanNilai={simpanNilai}
      />

      <RevisiFormModal target={revisiTarget} onClose={() => setRevisiTarget(null)} onSend={kirimRevisi} />

      <TugasFormModal
        open={tugasFormOpen}
        tugas={editTarget}
        mapelOptions={mapelOptions}
        onClose={() => { setTugasFormOpen(false); setEditTarget(null); }}
        onSaved={() => loadAll()}
      />
    </div>
  );
}
