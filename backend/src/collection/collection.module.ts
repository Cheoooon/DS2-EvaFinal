import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAlbum } from './user-album.entity.js';
import { UserSticker } from './user-sticker.entity.js';
import { Sticker } from '../stickers/sticker.entity.js';
import { CollectionService } from './collection.service.js';
import { CollectionController } from './collection.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserAlbum, UserSticker, Sticker]), AuthModule],
  providers: [CollectionService],
  controllers: [CollectionController],
  exports: [CollectionService],
})
export class CollectionModule {}