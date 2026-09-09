import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

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
  @IsIn(['SUBMIT', 'PILIHAN_GANDA', 'ESSAY', 'SPREADSHEET'])
  tipe?: string;

  @IsString()
  @IsOptional()
  starterSpreadsheet?: string;

  @IsString()
  @IsOptional()
  spreadsheetStarterLinks?: string;

  @IsString()
  @IsOptional()
  soal?: string;

  @IsString()
  @IsOptional()
  durasiMenit?: string;
}
