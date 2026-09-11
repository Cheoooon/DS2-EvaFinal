import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import type { User } from '../auth/user.entity.js';
import type { Album } from '../albums/album.entity.js';

@Entity('user_albums')
export class UserAlbum {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  started_at: Date;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  user: Relation<User>;

  @ManyToOne('Album', { onDelete: 'CASCADE' })
  album: Relation<Album>;
}