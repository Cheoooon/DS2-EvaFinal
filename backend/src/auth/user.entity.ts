import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import type { Album } from '../albums/album.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  // Usamos el nombre 'Album' en string y Relation<Album[]> para romper el ciclo ESM
  @OneToMany('Album', (album: Album) => album.owner)
  albums: Relation<Album[]>;
}