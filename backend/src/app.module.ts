import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module.js';
import { User } from './auth/user.entity.js';

import { Album } from './albums/album.entity.js';
import { AlbumsModule } from './albums/albums.module.js';

import { Sticker } from './stickers/sticker.entity.js';
import { StickersModule } from './stickers/stickers.module.js';

import { UserAlbum } from './collection/user-album.entity.js';
import { UserSticker } from './collection/user-sticker.entity.js';
import { CollectionModule } from './collection/collection.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, Album, Sticker, UserAlbum, UserSticker],
        synchronize: true, // Solo desarrollo
      }),
    }),
    AuthModule,
    AlbumsModule,
    StickersModule,
    CollectionModule,
  ],
})
export class AppModule {}