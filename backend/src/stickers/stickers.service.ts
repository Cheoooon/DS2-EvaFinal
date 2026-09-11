import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sticker, StickerType } from './sticker.entity.js';
import { Album } from '../albums/album.entity.js';

export interface CreateStickerDto {
  number: number;
  name: string;
  image?: string;
  sticker_type?: StickerType;
}

@Injectable()
export class StickersService {
  constructor(
    @InjectRepository(Sticker)
    private stickersRepository: Repository<Sticker>,
    @InjectRepository(Album)
    private albumsRepository: Repository<Album>,
  ) {}

  private async verifyOwner(albumId: number, userId: number) {
    const album = await this.albumsRepository.findOne({
      where: { id: albumId },
      relations: { owner: true },
    });

    if (!album) throw new NotFoundException('Álbum no encontrado');
    if (album.owner.id !== userId) throw new ForbiddenException('No tienes permisos sobre este álbum');
    return album;
  }

  async createBulk(albumId: number, userId: number, stickersData: CreateStickerDto[]) {
    const album = await this.verifyOwner(albumId, userId);

    const stickers = stickersData.map((dto) =>
      this.stickersRepository.create({
        ...dto,
        album,
      }),
    );

    return this.stickersRepository.save(stickers);
  }

  async findByAlbum(albumId: number) {
    return this.stickersRepository.find({
      where: { album: { id: albumId } },
      order: { number: 'ASC' },
    });
  }

  async findOne(id: number) {
    const sticker = await this.stickersRepository.findOne({ 
      where: { id }, 
      relations: { album: { owner: true } }
    });
    if (!sticker) throw new NotFoundException('Lámina no encontrada');
    return sticker;
  }

  async update(id: number, userId: number, data: { number?: number; name?: string; sticker_type?: StickerType; image?: string }) {
    const sticker = await this.findOne(id);
    await this.verifyOwner(sticker.album.id, userId);
    await this.stickersRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number, userId: number) {
    const sticker = await this.findOne(id);
    await this.verifyOwner(sticker.album.id, userId);
    await this.stickersRepository.delete(id);
    return { success: true };
  }
}