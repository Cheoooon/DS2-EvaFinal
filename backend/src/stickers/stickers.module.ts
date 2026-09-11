import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sticker } from './sticker.entity.js';
import { Album } from '../albums/album.entity.js';
import { StickersService } from './stickers.service.js';
import { StickersController } from './stickers.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Sticker, Album]), AuthModule],
  providers: [StickersService],
  controllers: [StickersController],
  exports: [StickersService],
})
export class StickersModule {}