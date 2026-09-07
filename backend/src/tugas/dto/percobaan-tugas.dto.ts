import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SubmitPercobaanDto {
  @IsString()
  @IsOptional()
  catatan?: string;

  @IsString()
  @IsOptional()
  submittedPraktik?: string;

  @IsString()
  @IsOptional()
  jawaban?: string;

  @IsBoolean()
  @IsOptional()
  dipaksa?: boolean;
}
