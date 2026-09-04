import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

// Dikirim lewat multipart/form-data (satu form dengan file upload) sebagai
// string JSON — mis. fd.append('kelasIds', JSON.stringify(['id1','id2'])) —
// karena field berulang di FormData tidak konsisten diparse jadi array oleh
// multer. Kosong/tidak diisi berarti "Semua Kelas". Sama seperti pola di
// CreateMateriDto.
function parseKelasIds(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export class CreateTugasDto {
  @IsString()
  @IsNotEmpty({ message: 'Mata pelajaran tidak boleh kosong' })
  mapel: string;

  @Transform(({ value }) => parseKelasIds(value))
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  kelasIds?: string[];

  @IsString()
  @IsNotEmpty({ message: 'Judul tidak boleh kosong' })
  judul: string;

  @IsString()
  @IsOptional()
  deskripsi?: string;

  @IsString()
  @IsNotEmpty({ message: 'Deadline tidak boleh kosong' })
  deadline: string;

  @IsString()
  @IsOptional()
  @IsIn(['SUBMIT', 'PRAKTIK', 'PILIHAN_GANDA', 'ESSAY'])
  tipe?: string;

  // JSON string dari array baris jurnal awal [{tanggal,akun,debit,kredit}] —
  // dipakai untuk tipe PRAKTIK.
  @IsString()
  @IsOptional()
  starterPraktik?: string;

  // JSON string dari array soal — dipakai untuk tipe PILIHAN_GANDA/ESSAY.
  // Diparse & divalidasi manual di service (bentuknya dinamis per tipe soal,
  // tidak praktis dipetakan ke class-validator per field).
  @IsString()
  @IsOptional()
  soal?: string;

  // Durasi pengerjaan (menit) untuk mode lockdown (PRAKTIK/PILIHAN_GANDA/
  // ESSAY) — string karena dikirim lewat multipart/form-data, diparse &
  // wajib divalidasi manual di service (wajib untuk PILIHAN_GANDA/ESSAY,
  // opsional untuk PRAKTIK, diabaikan untuk SUBMIT).
  @IsString()
  @IsOptional()
  durasiMenit?: string;
}
