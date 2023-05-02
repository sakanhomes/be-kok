import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UsePipes } from '@nestjs/common';
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
import { CreateVideoValidator } from './validators/create-video.validator';
import { CreateVideoDto } from './dtos/create-video.dto';
import { CreateVideoAction } from './actions/create-video.action';
import { RecordViewAction } from './actions/record-view.action';
import { EnrollViewRewardAction } from './actions/enroll-view-reward.actions';
import { RewardsLimitExceededException } from './exceptions/rewards-limit-exceeded.exception';
import { EnrollCreationRewardAction } from './actions/enroll-creation-reward.action';
import { DeleteVideoAction } from './actions/delete-video.action';
import { AddVideoLikeAction } from './actions/add-video-like.action';
import { RemoveVideoLikeAction } from './actions/remove-video-like.action';
import { CreateVideoResourceAction } from './actions/create-video-resource.action';
import { RecordTrendingActivityAction } from './actions/record-trending-activity.action';
import { NotifyCreatorAboutVideoActivityAction } from './actions/notify-creator-about-video-activity.action';
import { VideoActivity } from './enums/video-activity.enum';

@Controller('/videos')
export class VideosController {
    public constructor(
        private readonly resouceCreator: CreateVideoResourceAction,
        private readonly videoCreator: CreateVideoAction,
        private readonly videoUpdater: UpdateVideoAction,
        private readonly videoDeleter: DeleteVideoAction,
        private readonly likeAdder: AddVideoLikeAction,
        private readonly likeRemover: RemoveVideoLikeAction,
        private readonly viewsRecorder: RecordViewAction,
        private readonly creationRewardsEnroller: EnrollCreationRewardAction,
        private readonly viewRewardEnroller: EnrollViewRewardAction,
        private readonly trendingActivityRecorder: RecordTrendingActivityAction,
        private readonly creatorNotifier: NotifyCreatorAboutVideoActivityAction,
    ) {}

    @Post('/')
    @HttpCode(200)
    @JwtAuth()
    @UsePipes(CreateVideoValidator)
    public async createVideo(@CurrentUser() user: User, @Body() data: CreateVideoDto) {
        const video = await this.videoCreator.run(user, data);

        try {
            await this.creationRewardsEnroller.run(user, video);
        } catch (error) {
            if (!(error instanceof RewardsLimitExceededException)) {
                throw error;
            }
        }

        return new VideoResource(video);
    }

    @Get('/:publicId')
    @OptionalJwtAuth()
    public async entity(@CurrentUser() user: User | null, @Param('publicId', ResolveModelPipe) video: Video) {
        if (!video.isPublic && !OwnershipVerifier.verify(user, video)) {
            throw new ForbiddenException();
        }

        return await this.resouceCreator.run(user, video);
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

        return new VideoResource(video, { creator: user });
    }

    @Delete('/:publicId')
    @JwtAuth()
    public async delete(@CurrentUser() user: User, @Param('publicId', ResolveModelPipe) video: Video) {
        OwnershipVerifier.verifyOrFail(user, video);

        await this.videoDeleter.run(video);
    }

    @Post('/:publicId/likes')
    @HttpCode(200)
    @JwtAuth()
    public async addLikeToVideo(@CurrentUser() user: User, @Param('publicId', ResolveModelPipe) video: Video) {
        video = await this.likeAdder.run(user, video);

        this.creatorNotifier.run(video, user, VideoActivity.LIKE);

        return await this.resouceCreator.run(user, video);
    }

    @Delete('/:publicId/likes')
    @JwtAuth()
    public async removeLikeFromVideo(@CurrentUser() user: User, @Param('publicId', ResolveModelPipe) video: Video) {
        video = await this.likeRemover.run(user, video);

        return await this.resouceCreator.run(user, video);
    }

    @Post('/:publicId/viewed')
    @HttpCode(200)
    @OptionalJwtAuth()
    public async trackView(@CurrentUser() user: User | null, @Param('publicId', ResolveModelPipe) video: Video) {
        video = await this.viewsRecorder.run(user, video);

        await this.trendingActivityRecorder.run(user, video);

        if (user) {
            await this.viewRewardEnroller.runSilent(video);
        }

        return await this.resouceCreator.run(user, video);
    }
}
