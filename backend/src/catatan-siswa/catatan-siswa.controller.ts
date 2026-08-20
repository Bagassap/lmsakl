import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CatatanSiswaService } from './catatan-siswa.service';
import { CreateCatatanSiswaDto } from './dto/create-catatan-siswa.dto';
import { UpdateCatatanSiswaDto } from './dto/update-catatan-siswa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('catatan-siswa')
export class CatatanSiswaController {
  constructor(private readonly service: CatatanSiswaService) {}

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
