import { Controller, Get, Param } from '@nestjs/common';
import { VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
    constructor(private readonly videosService: VideosService) {}

    @Get('')
    async findByIdentification() {
        return await this.videosService.getVideos();
    }
}
