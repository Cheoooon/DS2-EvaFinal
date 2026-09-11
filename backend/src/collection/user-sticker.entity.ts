import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import type { Relation } from 'typeorm';
import type { User } from '../auth/user.entity.js';
import type { Sticker } from '../stickers/sticker.entity.js';

@Entity('user_stickers')
@Unique(['user', 'sticker'])
export class UserSticker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  quantity: number;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  user: Relation<User>;

  @ManyToOne('Sticker', { onDelete: 'CASCADE' })
  sticker: Relation<Sticker>;
}