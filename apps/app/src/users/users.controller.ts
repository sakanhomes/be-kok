import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { JwtAuth } from '@app/core/auth/decorators/jwt-auth.decorator';
import { OptionalJwtAuth } from '@app/core/auth/decorators/optional-jwt-auth.decorator';
import { ResolveModelPipe } from '@app/core/orm/pipes/resolve-model.pipe';
import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { VideoResource } from '../videos/resources/video.resource';
import { GetUserVideos } from './actions/get-user-videos.action';
import { SubscribeToUserAction } from './actions/subscribe-to-user.action';
import { UnsubscribeFromUserAction } from './actions/unsubscribe-from-user.action copy';
import { User } from './models/user.model';
import { UserResource } from './resources/user.resource';

@Controller('users')
export class UsersController {
    public constructor(
        private readonly videosLoader: GetUserVideos,
        private readonly subscriber: SubscribeToUserAction,
        private readonly unsubscriber: UnsubscribeFromUserAction,
    ) {}

    @Get('/:address')
    public async entity(@Param('address', ResolveModelPipe) user: User) {
        return new UserResource(user);
    }

    @Get('/:address/videos')
    @OptionalJwtAuth()
    public async videos(
        @CurrentUser() currentUser: User | null,
        @Param('address', ResolveModelPipe) user: User,
    ) {
        const videos = await this.videosLoader.run(user, currentUser?.id !== user.id);

        return VideoResource.collection(videos);
    }

    @Post('/:address/subscriptions')
    @JwtAuth()
    public async subscribe(
        @CurrentUser() subscriber: User,
        @Param('address', ResolveModelPipe) creator: User,
    ) {
        creator = await this.subscriber.run(creator, subscriber);

        return new UserResource(creator);
    }

    @Delete('/:address/subscriptions')
    @JwtAuth()
    public async unsubscribe(
        @CurrentUser() subscriber: User,
        @Param('address', ResolveModelPipe) creator: User,
    ) {
        creator = await this.unsubscriber.run(creator, subscriber);

        return new UserResource(creator);
    }
}
