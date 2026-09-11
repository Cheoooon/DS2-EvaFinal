import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(data: { name: string; description?: string; is_shared?: boolean }, user: { id: number }) {
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

  async findCommunityAlbums() {
    return this.albumsRepository.find({
      where: { is_shared: true, is_active: true },
      relations: { owner: true },
      order: { created_at: 'DESC' },
    });
  }
}