import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SubmitPercobaanDto {
  @IsString()
  @IsOptional()
  catatan?: string;

  @IsString()
  @IsOptional()
  submittedSpreadsheet?: string;

  @IsString()
  @IsOptional()
  jawaban?: string;

  @IsBoolean()
  @IsOptional()
  dipaksa?: boolean;
}
