import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from './album.entity.js';
import { User } from '../auth/user.entity.js';

@Injectable()
export class AlbumsService {
  constructor(
    @InjectRepository(Album)
    private albumsRepository: Repository<Album>,
  ) {}

  private async verifyOwner(albumId: number, userId: number) {
    const album = await this.albumsRepository.findOne({
      where: { id: albumId },
      relations: { owner: true },
    });
    if (!album) throw new NotFoundException('Álbum no encontrado');
    if (album.owner.id !== userId) throw new ForbiddenException('Sin permisos sobre este álbum');
    return album;
  }

  async create(data: { name: string; description?: string; is_shared?: boolean; cover_image?: string }, user: { id: number }) {
    const album = this.albumsRepository.create({
      ...data,
      owner: { id: user.id } as User,
    });
    return this.albumsRepository.save(album);
  }

  async findMyAlbums(userId: number) {
    return this.albumsRepository.find({
      where: { owner: { id: userId }, is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number, userId?: number) {
    const album = await this.albumsRepository.findOne({
      where: { id, is_active: true },
      relations: { owner: true },
    });

    if (!album) throw new NotFoundException('Álbum no encontrado');

    if (!album.is_shared && album.owner.id !== userId) {
      throw new ForbiddenException('Este álbum es privado');
    }

    if (album.owner) {
      delete (album.owner as any).password_hash;
    }

    return album;
  }

  async update(id: number, userId: number, data: { name?: string; description?: string; is_shared?: boolean; cover_image?: string }) {
    await this.verifyOwner(id, userId);
    await this.albumsRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number, userId: number) {
    await this.verifyOwner(id, userId);
    await this.albumsRepository.update(id, { is_active: false }); // Soft-delete
    return { success: true };
  }

  async findCommunityAlbums() {
    return this.albumsRepository.find({
      where: { is_shared: true, is_active: true },
      relations: { owner: true },
      order: { created_at: 'DESC' },
    });
  }
}