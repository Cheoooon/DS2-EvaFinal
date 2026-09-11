import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import type { Album } from '../albums/album.entity.js';

export enum StickerType {
  NORMAL = 'normal',
  HOLOGRAFICA = 'holografica',
  ESPECIAL = 'especial',
}

@Entity('stickers')
export class Sticker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  number: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  image: string;

  @Column({
    type: 'enum',
    enum: StickerType,
    default: StickerType.NORMAL,
  })
  sticker_type: StickerType;

  @ManyToOne('Album', (album: Album) => album.stickers, { onDelete: 'CASCADE' })
  album: Relation<Album>;
}