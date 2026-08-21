import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTugasDto {
  @IsString()
  @IsNotEmpty({ message: 'Mata pelajaran tidak boleh kosong' })
  mapel: string;

  @IsString()
  @IsOptional()
  kelasId?: string;

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
}
