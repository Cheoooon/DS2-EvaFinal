import { Controller, Post, Get, Put, Body, Param, UseGuards, Request, ParseIntPipe, UseInterceptors, UploadedFiles, UploadedFile, Delete } from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { StickersService } from './stickers.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('albums/:albumId/stickers')
@UseGuards(JwtAuthGuard)
export class StickersController {
  constructor(private readonly stickersService: StickersService) {}

  @Post('bulk')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads/stickers',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async createBulk(
    @Param('albumId', ParseIntPipe) albumId: number,
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Request() req: any,
  ) {
    const rawStickers = typeof body.stickers === 'string' ? JSON.parse(body.stickers) : body.stickers || [];
    
    // Mapear archivos subidos según su fieldname (ej: image_0, image_1)
    const fileMap = new Map<string, string>();
    if (files) {
      files.forEach((file) => {
        fileMap.set(file.fieldname, `/uploads/stickers/${file.filename}`);
      });
    }

    const processedStickers = rawStickers.map((s: any, index: number) => ({
      number: Number(s.number),
      name: s.name,
      sticker_type: s.sticker_type,
      image: fileMap.get(`image_${index}`) || null,
    }));

    return this.stickersService.createBulk(albumId, req.user.id, processedStickers);
  }

  @Get()
  findByAlbum(@Param('albumId', ParseIntPipe) albumId: number) {
    return this.stickersService.findByAlbum(albumId);
  }

  @Get(':stickerId')
  findOneSticker(@Param('stickerId', ParseIntPipe) stickerId: number) {
    return this.stickersService.findOne(stickerId);
  }

  @Put(':stickerId')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/stickers',
      filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueName}${extname(file.originalname)}`);
      },
    }),
  }))
  updateSticker(
    @Param('stickerId', ParseIntPipe) stickerId: number,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const data: any = {
      number: body.number ? Number(body.number) : undefined,
      name: body.name,
      sticker_type: body.sticker_type,
    };
    if (file) data.image = `/uploads/stickers/${file.filename}`;
    return this.stickersService.update(stickerId, req.user.id, data);
  }

  @Delete(':stickerId')
  removeSticker(@Param('stickerId', ParseIntPipe) stickerId: number, @Request() req: any) {
    return this.stickersService.remove(stickerId, req.user.id);
  }
}