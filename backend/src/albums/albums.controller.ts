import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AlbumsService } from './albums.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('albums')
@UseGuards(JwtAuthGuard)
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Post()
  create(@Body() body: { name: string; description?: string; is_shared?: boolean }, @Request() req: any) {
    return this.albumsService.create(body, req.user);
  }

  @Get('my-albums')
  findMyAlbums(@Request() req: any) {
    return this.albumsService.findMyAlbums(req.user.id);
  }

  @Get('community')
  findCommunityAlbums() {
    return this.albumsService.findCommunityAlbums();
  }
}