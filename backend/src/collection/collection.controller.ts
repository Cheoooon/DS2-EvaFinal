import { Controller, Post, Delete, Get, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { CollectionService } from './collection.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('collection')
@UseGuards(JwtAuthGuard)
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post('albums/:id/follow')
  follow(@Param('id', ParseIntPipe) albumId: number, @Request() req: any) {
    return this.collectionService.followAlbum(req.user.id, albumId);
  }

  @Delete('albums/:id/unfollow')
  unfollow(@Param('id', ParseIntPipe) albumId: number, @Request() req: any) {
    return this.collectionService.unfollowAlbum(req.user.id, albumId);
  }

  @Get('my-followed')
  getMyFollowedAlbums(@Request() req: any) {
    return this.collectionService.getMyFollowedAlbums(req.user.id);
  }

  @Get('albums/:id/book')
  getBook(@Param('id', ParseIntPipe) albumId: number, @Request() req: any) {
    return this.collectionService.getAlbumBook(req.user.id, albumId);
  }

  @Post('stickers/:id/add')
  addSticker(@Param('id', ParseIntPipe) stickerId: number, @Request() req: any) {
    return this.collectionService.addSticker(req.user.id, stickerId);
  }

  @Post('stickers/:id/remove')
  removeSticker(@Param('id', ParseIntPipe) stickerId: number, @Request() req: any) {
    return this.collectionService.removeSticker(req.user.id, stickerId);
  }
}