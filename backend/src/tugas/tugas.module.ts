import { Module } from '@nestjs/common';
import { TugasController } from './tugas.controller';
import { TugasService } from './tugas.service';
import { SpreadsheetExportService } from './spreadsheet-export.service';
import { SpreadsheetImportService } from './spreadsheet-import.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [TugasController],
  providers: [TugasService, SpreadsheetExportService, SpreadsheetImportService],
})
export class TugasModule {}
