import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
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

export class UpdateTugasDto {
  @IsString()
  @IsOptional()
  mapel?: string;

  @IsOptional()
  @Transform(({ value }) => parseKelasIds(value))
  @IsArray()
  @IsString({ each: true })
  kelasIds?: string[];

  @IsString()
  @IsOptional()
  judul?: string;

  @IsString()
  @IsOptional()
  deskripsi?: string;

  @IsString()
  @IsOptional()
  deadline?: string;

  @IsString()
  @IsOptional()
  @IsIn(['SUBMIT', 'PRAKTIK', 'PILIHAN_GANDA', 'ESSAY'])
  tipe?: string;

  @IsString()
  @IsOptional()
  starterPraktik?: string;

  @IsString()
  @IsOptional()
  soal?: string;

  @IsString()
  @IsOptional()
  durasiMenit?: string;
}
