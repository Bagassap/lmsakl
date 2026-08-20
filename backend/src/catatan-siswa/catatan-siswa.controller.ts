import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, Request, Res, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { CatatanSiswaService } from './catatan-siswa.service';
import { CatatanSiswaPdfService } from './catatan-siswa-pdf.service';
import { CatatanSiswaExcelService } from './catatan-siswa-excel.service';
import { CreateCatatanSiswaDto } from './dto/create-catatan-siswa.dto';
import { UpdateCatatanSiswaDto } from './dto/update-catatan-siswa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/client';

function sanitizeFilenamePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'export';
}

@UseGuards(JwtAuthGuard)
@Controller('catatan-siswa')
export class CatatanSiswaController {
  constructor(
    private readonly service: CatatanSiswaService,
    private readonly pdfService: CatatanSiswaPdfService,
    private readonly excelService: CatatanSiswaExcelService,
  ) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.GURU)
  @Get('summary')
  getSummary(@Request() req: any) {
    return this.service.getSummary({ id: req.user.id, role: req.user.role });
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SISWA)
  @Get('saya')
  getSaya(@Request() req: any) {
    return this.service.findSaya(req.user.id);
  }

  @Get('siswa/:siswaId')
  findBySiswa(@Param('siswaId') siswaId: string, @Request() req: any) {
    return this.service.findBySiswa(siswaId, { id: req.user.id, role: req.user.role });
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.GURU)
  @Get('export-pdf')
  async exportPdf(@Query('kelasId') kelasId: string, @Request() req: any, @Res() res: Response) {
    if (!kelasId) throw new BadRequestException('kelasId wajib diisi');
    const rekap = await this.service.getRekapKelas(kelasId, { id: req.user.id, role: req.user.role });
    const buffer = await this.pdfService.buildKelas(rekap);
    const filename = `CatatanSiswa_${sanitizeFilenamePart(rekap.kelas?.nama ?? 'Kelas')}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.GURU)
  @Get('export-pdf-siswa')
  async exportPdfSiswa(@Query('siswaId') siswaId: string, @Request() req: any, @Res() res: Response) {
    if (!siswaId) throw new BadRequestException('siswaId wajib diisi');
    const rekap = await this.service.findBySiswa(siswaId, { id: req.user.id, role: req.user.role });
    const buffer = await this.pdfService.buildSiswa(rekap);
    const filename = `CatatanSiswa_${sanitizeFilenamePart(rekap.siswa.nama ?? 'Siswa')}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.GURU)
  @Get('export-excel')
  async exportExcel(@Query('kelasId') kelasId: string, @Request() req: any, @Res() res: Response) {
    if (!kelasId) throw new BadRequestException('kelasId wajib diisi');
    const rekap = await this.service.getRekapKelas(kelasId, { id: req.user.id, role: req.user.role });
    const buffer = await this.excelService.buildKelas(rekap);
    const filename = `CatatanSiswa_${sanitizeFilenamePart(rekap.kelas?.nama ?? 'Kelas')}.xlsx`;
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.GURU)
  @Get('export-excel-siswa')
  async exportExcelSiswa(@Query('siswaId') siswaId: string, @Request() req: any, @Res() res: Response) {
    if (!siswaId) throw new BadRequestException('siswaId wajib diisi');
    const rekap = await this.service.findBySiswa(siswaId, { id: req.user.id, role: req.user.role });
    const buffer = await this.excelService.buildSiswa(rekap);
    const filename = `CatatanSiswa_${sanitizeFilenamePart(rekap.siswa.nama ?? 'Siswa')}.xlsx`;
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.GURU)
  @Post()
  create(@Body() dto: CreateCatatanSiswaDto, @Request() req: any) {
    return this.service.create(dto, { id: req.user.id, role: req.user.role });
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.GURU)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCatatanSiswaDto, @Request() req: any) {
    return this.service.update(id, dto, { id: req.user.id, role: req.user.role });
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.GURU)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.service.remove(id, { id: req.user.id, role: req.user.role });
  }
}
