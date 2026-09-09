export type StatusTugas = "TERKIRIM" | "DITERIMA" | "REVISI";
export type TugasTipe = "SUBMIT" | "PILIHAN_GANDA" | "ESSAY" | "SPREADSHEET";

export const LOCKDOWN_TIPE = new Set<string>(["PILIHAN_GANDA", "ESSAY", "SPREADSHEET"]);
export const MAKSIMAL_PERCOBAAN = 2;

export type TugasKelasRef = { id: string; nama: string };

export type KelasSiswaItem = { id: string; nama: string | null; nis: string };
export type SpreadsheetStarterRef = { siswaId: string; sourceUrl: string | null };

export type TugasSoalItem = {
  id: string;
  urutan: number;
  pertanyaan: string;
  pilihanA: string | null;
  pilihanB: string | null;
  pilihanC: string | null;
  pilihanD: string | null;
  jawabanBenar?: string | null;
};

export type TugasJawabanItem = {
  id: string;
  soalId: string;
  jawabanPilihan: string | null;
  jawabanEssay: string | null;
  soal?: TugasSoalItem;
};

export type TugasSubmisiItem = {
  id: string;
  tugasId: string;
  siswaId: string;
  fileUrl: string | null;
  fileName: string | null;
  submittedSpreadsheet: string | null;
  catatan: string | null;
  pesanRevisi: string | null;
  status: StatusTugas;
  nilai: number | null;
  submittedAt: string;
  updatedAt: string;
  tugas?: { id: string; judul: string; tipe?: string; mapel?: string };
  siswa?: { id: string; nama: string | null; user?: { id: string; nama: string } | null };
  jawaban?: TugasJawabanItem[];
  jumlahPercobaan?: number;
  terkunci?: boolean;
  dipaksaKeluar?: boolean;
  waktuMulai?: string | null;
  deadlineWaktu?: string | null;
  bonusPercobaan?: number;
};

export function maksimalPercobaanEfektif(s?: { bonusPercobaan?: number } | null) {
  return MAKSIMAL_PERCOBAAN + (s?.bonusPercobaan ?? 0);
}

export type TugasItem = {
  id: string;
  mapel: string;
  kelasList: TugasKelasRef[];
  judul: string;
  deskripsi: string | null;
  deadline: string;
  tipe: string;
  fileUrl: string | null;
  fileName: string | null;
  starterSpreadsheet: string | null;
  durasiMenit?: number | null;
  createdBy: { id: string; nama: string; role: string };
  createdAt: string;
  updatedAt: string;
  _count?: { submisi: number };
  submisi?: TugasSubmisiItem[];
  soal?: TugasSoalItem[];
  spreadsheetStarters?: SpreadsheetStarterRef[];
};

export function formatTgl(s: string) {
  return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
}

export function formatTglJam(s: string) {
  const formatted = new Date(s).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
  return `${formatted} WIB`;
}

export function isTugasActive(t: { deadline: string }) {
  return new Date(t.deadline).getTime() > Date.now();
}

export function statusInfo(s: StatusTugas) {
  if (s === "DITERIMA") return { bg: "#ECFCCB", color: "#4D7C0F", label: "Diterima" };
  if (s === "REVISI") return { bg: "#F8D6DA", color: "#9E1B2E", label: "Perlu Revisi" };
  return { bg: "#E3ECFF", color: "#1745B0", label: "Menunggu Review" };
}

export function tipeLabel(tipe: string) {
  if (tipe === "PILIHAN_GANDA") return "Pilihan Ganda";
  if (tipe === "ESSAY") return "Essay";
  if (tipe === "SPREADSHEET") return "Spreadsheet";
  return "Kirim File";
}

export function hitungSkorPilihanGanda(jawaban: TugasJawabanItem[] | undefined) {
  if (!jawaban || jawaban.length === 0) return { benar: 0, total: 0 };
  const total = jawaban.length;
  const benar = jawaban.filter((j) => j.soal?.jawabanBenar && j.jawabanPilihan === j.soal.jawabanBenar).length;
  return { benar, total };
}

export function nilaiPilihanGanda(submisi: { nilai?: number | null; jawaban?: TugasJawabanItem[] }): number | null {
  if (typeof submisi.nilai === "number") return submisi.nilai;
  const { benar, total } = hitungSkorPilihanGanda(submisi.jawaban);
  if (total === 0) return null;
  return Math.round((benar / total) * 100);
}
