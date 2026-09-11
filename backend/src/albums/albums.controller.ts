import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AlbumsService } from './albums.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

const storageConfig = diskStorage({
  destination: './uploads/covers',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueName}${extname(file.originalname)}`);
  },
});

@Controller('albums')
@UseGuards(JwtAuthGuard)
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('cover', { storage: storageConfig }))
  create(@Body() body: any, @UploadedFile() file: Express.Multer.File, @Request() req: any) {
    const cover_image = file ? `/uploads/covers/${file.filename}` : undefined;
    const is_shared = body.is_shared === 'true' || body.is_shared === true;
    return this.albumsService.create({ ...body, is_shared, cover_image }, req.user);
  }

  @Get('my-albums')
  findMyAlbums(@Request() req: any) {
    return this.albumsService.findMyAlbums(req.user.id);
  }

  @Get('community')
  findCommunityAlbums() {
    return this.albumsService.findCommunityAlbums();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.albumsService.findOne(id, req.user.id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('cover', { storage: storageConfig }))
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any, @UploadedFile() file: Express.Multer.File, @Request() req: any) {
    const updateData: any = { ...body };
    if (body.is_shared !== undefined) {
      updateData.is_shared = body.is_shared === 'true' || body.is_shared === true;
    }
    if (file) {
      updateData.cover_image = `/uploads/covers/${file.filename}`;
    }
    return this.albumsService.update(id, req.user.id, updateData);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.albumsService.remove(id, req.user.id);
  }
}