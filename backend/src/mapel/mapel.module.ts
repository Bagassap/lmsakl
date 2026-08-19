import { Module } from '@nestjs/common';
import { MapelController } from './mapel.controller';
import { MapelService } from './mapel.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MapelController],
  providers: [MapelService],
})
export class MapelModule {}
