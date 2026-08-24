export type StatusPenempatan = "AKTIF" | "SELESAI" | "BATAL";

export type TempatMagang = {
  id: string;
  namaTempat: string;
  alamat: string;
  kontak: string | null;
  bidangUsaha: string | null;
  kuota: number;
  _count?: { penempatan: number };
};

export type PenempatanMagang = {
  id: string;
  siswa: {
    id: string;
    nis: string;
    nama: string | null;
    kelas: { id: string; nama: string };
    user: { id: string; nama: string; fotoProfil: string | null } | null;
  };
  tempatMagang: TempatMagang;
  guruPembimbing: { id: string; user: { id: string; nama: string } };
  tanggalMulai: string;
  tanggalSelesai: string | null;
  status: StatusPenempatan;
  createdAt: string;
};

export const STATUS_PENEMPATAN_CFG: Record<StatusPenempatan, { label: string; bg: string; clr: string }> = {
  AKTIF: { label: "Aktif", bg: "#E3ECFF", clr: "#2962FF" },
  SELESAI: { label: "Selesai", bg: "#ECFCCB", clr: "#4D7C0F" },
  BATAL: { label: "Batal", bg: "#FCF0F1", clr: "#D32F2F" },
};
