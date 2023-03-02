import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetRandomVideosAction } from './actions/get-random-videos.action';
import { GetRandomVideosValidator } from './validators/get-random-videos.validator';
import { Video } from './models/video.model';
import { VideoResource } from './resources/video.resource';

@Controller('videos')
export class VideosController {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
        private readonly videosRandomizer: GetRandomVideosAction,
    ) {}

    @Get('/random')
    @UsePipes(GetRandomVideosValidator)
    public async random(@Query() data: { amount: number }) {
        const videos = await this.videosRandomizer.run(data.amount);

        return VideoResource.collection(videos);
    }

    @Get('/:id')
    public async entity(@Param('id') id: string) {
        const video = await this.videos.findOneOrFail({
            where: { publicId: id },
            relations: ['user'],
        });

        return new VideoResource(video, video.user);
    }
}
