import { onlyKeys, unixtime } from '@app/core/helpers';
import { Response } from '@app/core/http/response';
import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetRandomVideosAction } from './actions/get-random-videos.action';
import { Category } from './enums/category.enum';
import { GetRandomVideosValidator } from './validators/get-random-videos.validator';
import { Video } from './video.model';

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
        return Response.collection<Video>(
            Video,
            await this.videosRandomizer.run(data.amount),
            this.videoResouse,
        );
    }

    @Get('/:id')
    public async entity(@Param('id') id: string) {
        const video = await this.videos.findOneOrFail({
            where: { publicId: id },
            relations: ['user'],
        });

        return this.videoResponse(video);
    }

    private videoResouse(video: Video) {
        const resource = onlyKeys(video, [
            'title',
            'duration',
            'description',
            'previewImage',
            'video',
            'viewAmount',
            'likesAmount',
            'commentsAmount',
        ]);

        Object.assign(resource, {
            id: video.publicId,
            category: Category[video.categoryId],
            createdAt: unixtime(video.createdAt),
            user: onlyKeys(video.user, ['address', 'name', 'profileImage']),
        });

        return resource;
    }

    private videoResponse(video: Video) {
        return {
            video: this.videoResouse(video),
        };
    }
}
