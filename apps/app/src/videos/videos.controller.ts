import { onlyKeys, unixtime } from '@app/core/helpers';
import { Controller, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './enums/category.enum';
import { Video } from './video.model';

@Controller('videos')
export class VideosController {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
    ) {}

    @Get('/:id')
    public async entity(@Param('id') id: string) {
        const video = await this.videos.findOneOrFail({
            where: { publicId: id },
            relations: ['user'],
        });

        return this.videoResponse(video);
    }

    private videoResponse(video: Video) {
        const response = onlyKeys(video, [
            'title',
            'duration',
            'description',
            'previewImage',
            'video',
            'viewAmount',
            'likesAmount',
            'commentsAmount',
        ]);

        Object.assign(response, {
            id: video.publicId,
            category: Category[video.categoryId],
            createdAt: unixtime(video.createdAt),
            user: onlyKeys(video.user, ['address', 'name', 'profileImage']),
        });

        return {
            video: response,
        };
    }
}
