import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitTugasDto {
  @IsString()
  @IsNotEmpty({ message: 'Tugas tidak boleh kosong' })
  tugasId: string;

  @IsString()
  @IsOptional()
  catatan?: string;

  // JSON string dari array baris jurnal yang diisi siswa
  // [{tanggal,akun,debit,kredit}] — dipakai untuk tugas tipe PRAKTIK.
  @IsString()
  @IsOptional()
  submittedPraktik?: string;

  // JSON string dari array jawaban [{soalId, jawabanPilihan?, jawabanEssay?}]
  // — dipakai untuk tugas tipe PILIHAN_GANDA/ESSAY.
  @IsString()
  @IsOptional()
  jawaban?: string;
}
