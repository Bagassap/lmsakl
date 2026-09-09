import { IsNotEmpty, IsString } from 'class-validator';

export class ImportSpreadsheetLinkDto {
  @IsString()
  @IsNotEmpty({ message: 'Link spreadsheet tidak boleh kosong' })
  url: string;
}
