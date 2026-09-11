import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import type { User } from '../auth/user.entity.js';
import type { Sticker } from '../stickers/sticker.entity.js';

@Entity('albums')
export class Album {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  cover_image: string;

  @Column({ default: false })
  is_shared: boolean;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne('User', (user: User) => user.albums, { onDelete: 'CASCADE' })
  owner: Relation<User>;

  @OneToMany('Sticker', (sticker: Sticker) => sticker.album)
  stickers: Relation<Sticker[]>;
}