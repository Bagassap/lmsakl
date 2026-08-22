import { IsBoolean, IsOptional, IsString } from 'class-validator';

// Payload submit dari halaman lembar pengerjaan (lockdown) — dipakai baik
// untuk submit normal (klik "Selesai") maupun submit paksa (dipaksa=true,
// terpicu saat siswa terdeteksi keluar dari halaman).
export class SubmitPercobaanDto {
  @IsString()
  @IsOptional()
  catatan?: string;

  // JSON string dari array baris jurnal umum yang diisi siswa — dipakai
  // untuk tipe PRAKTIK.
  @IsString()
  @IsOptional()
  submittedPraktik?: string;

  // JSON string dari array jawaban [{soalId, jawabanPilihan?, jawabanEssay?}]
  @IsString()
  @IsOptional()
  jawaban?: string;

  @IsBoolean()
  @IsOptional()
  dipaksa?: boolean;
}
