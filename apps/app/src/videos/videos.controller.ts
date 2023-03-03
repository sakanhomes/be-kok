import { Body, Controller, Get, Param, Patch, Query, UsePipes } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetRandomVideosAction } from './actions/get-random-videos.action';
import { GetRandomVideosValidator } from './validators/get-random-videos.validator';
import { Video } from './models/video.model';
import { VideoResource } from './resources/video.resource';
import { ResolveModelPipe } from '@app/core/orm/pipes/resolve-model.pipe';
import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';
import { UpdateVideoDto } from './dtos/update-video.dto';
import { UpdateVideoValidator } from './validators/update-video.validator';
import { UpdateVideoAction } from './actions/update-video.action';
import { OwnershipVerifier } from '@app/core/orm/ownership-verifier';
import { JwtAuth } from '@app/core/auth/decorators/jwt-auth.decorator';
import { OptionalJwtAuth } from '@app/core/auth/decorators/optional-jwt-auth.decorator';
import { ForbiddenException } from '@app/core/exceptions/app/forbidden.exception';

@Controller('videos')
export class VideosController {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
        private readonly videosRandomizer: GetRandomVideosAction,
        private readonly videoUpdater: UpdateVideoAction,
    ) {}

    @Get('/random')
    @UsePipes(GetRandomVideosValidator)
    public async random(@Query() data: { amount: number }) {
        const videos = await this.videosRandomizer.run(data.amount);

        return VideoResource.collection(videos);
    }

    @Get('/:id')
    @OptionalJwtAuth()
    public async entity(@CurrentUser() user: User | null, @Param('id') id: string) {
        const video = await this.videos.findOneOrFail({
            where: { publicId: id },
            relations: ['user'],
        });

        if (!video.isPublic && !OwnershipVerifier.verify(user, video)) {
            throw new ForbiddenException();
        }

        return new VideoResource(video, video.user);
    }

    @Patch('/:publicId')
    @JwtAuth()
    @UsePipes(UpdateVideoValidator)
    public async update(
        @CurrentUser() user: User,
        @Param('publicId', ResolveModelPipe) video: Video,
        @Body() data: UpdateVideoDto,
    ) {
        OwnershipVerifier.verifyOrFail(user, video);

        await this.videoUpdater.run(video, data);

        return new VideoResource(video, user);
    }
}