import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAlbum } from './user-album.entity.js';
import { UserSticker } from './user-sticker.entity.js';
import { Sticker } from '../stickers/sticker.entity.js';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(UserAlbum) private userAlbumsRepo: Repository<UserAlbum>,
    @InjectRepository(UserSticker) private userStickersRepo: Repository<UserSticker>,
    @InjectRepository(Sticker) private stickersRepo: Repository<Sticker>,
  ) {}

  async followAlbum(userId: number, albumId: number) {
    const existing = await this.userAlbumsRepo.findOne({
      where: { user: { id: userId }, album: { id: albumId } },
    });
    if (existing) return existing;

    const follow = this.userAlbumsRepo.create({
      user: { id: userId } as any,
      album: { id: albumId } as any,
    });
    return this.userAlbumsRepo.save(follow);
  }

  async unfollowAlbum(userId: number, albumId: number) {
    return this.userAlbumsRepo.delete({
      user: { id: userId },
      album: { id: albumId },
    });
  }

  async getMyFollowedAlbums(userId: number) {
    const follows = await this.userAlbumsRepo.find({
      where: { user: { id: userId } },
      relations: { album: { owner: true } },
      order: { started_at: 'DESC' },
    });
    return follows.map((follow) => follow.album);
  }

  async getAlbumBook(userId: number, albumId: number) {
    // 1. Validar que el usuario esté coleccionando este álbum
    const isFollowing = await this.userAlbumsRepo.findOne({
      where: { user: { id: userId }, album: { id: albumId } },
    });

    if (!isFollowing) {
      throw new ForbiddenException('No estás coleccionando este álbum');
    }

    // 2. Si lo sigue, continuamos con la lógica normal...
    const stickers = await this.stickersRepo.find({
      where: { album: { id: albumId } },
      order: { number: 'ASC' },
    });

    const userInventory = await this.userStickersRepo.find({
      where: { user: { id: userId }, sticker: { album: { id: albumId } } },
      relations: { sticker: true },
    });

    const inventoryMap = new Map<number, number>();
    userInventory.forEach((item) => inventoryMap.set(item.sticker.id, item.quantity));

    let totalCollected = 0;
    let totalDuplicates = 0;

    const items = stickers.map((sticker) => {
      const quantity = inventoryMap.get(sticker.id) || 0;
      if (quantity > 0) totalCollected++;
      if (quantity > 1) totalDuplicates += quantity - 1;

      return {
        ...sticker,
        quantity,
        is_owned: quantity > 0,
      };
    });

    return {
      stats: {
        total: stickers.length,
        collected: totalCollected,
        missing: stickers.length - totalCollected,
        duplicates: totalDuplicates,
      },
      stickers: items,
    };
  }

  async addSticker(userId: number, stickerId: number) {
    const sticker = await this.stickersRepo.findOne({
      where: { id: stickerId },
      relations: { album: true }
    });

    if (!sticker) throw new ForbiddenException('Lámina no encontrada');

    const isFollowing = await this.userAlbumsRepo.findOne({
      where: { user: { id: userId }, album: { id: sticker.album.id } },
    });
    if (!isFollowing) throw new ForbiddenException('No coleccionas el álbum de esta lámina');

    let item = await this.userStickersRepo.findOne({
      where: { user: { id: userId }, sticker: { id: stickerId } },
    });

    if (item) {
      item.quantity += 1;
    } else {
      item = this.userStickersRepo.create({
        user: { id: userId } as any,
        sticker: { id: stickerId } as any,
        quantity: 1,
      });
    }

    return this.userStickersRepo.save(item);
  }

async removeSticker(userId: number, stickerId: number) {
    const sticker = await this.stickersRepo.findOne({
      where: { id: stickerId },
      relations: { album: true },
    });

    if (!sticker) throw new ForbiddenException('Lámina no encontrada');

    const isFollowing = await this.userAlbumsRepo.findOne({
      where: { user: { id: userId }, album: { id: sticker.album.id } },
    });

    if (!isFollowing) throw new ForbiddenException('No coleccionas el álbum de esta lámina');

    const item = await this.userStickersRepo.findOne({
      where: { user: { id: userId }, sticker: { id: stickerId } },
    });

    if (!item) return { quantity: 0 };

    if (item.quantity > 1) {
      item.quantity -= 1;
      return this.userStickersRepo.save(item);
    } else {
      await this.userStickersRepo.remove(item);
      return { quantity: 0 };
    }
  }
}