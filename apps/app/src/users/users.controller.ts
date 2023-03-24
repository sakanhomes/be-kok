import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { JwtAuth } from '@app/core/auth/decorators/jwt-auth.decorator';
import { OptionalJwtAuth } from '@app/core/auth/decorators/optional-jwt-auth.decorator';
import { NotFoundException } from '@app/core/exceptions/app/not-found.exception';
import { OwnershipVerifier } from '@app/core/orm/ownership-verifier';
import { ResolveModelPipe, ResolveModelUsing } from '@app/core/orm/pipes/resolve-model.pipe';
import { Controller, Delete, Get, Param, Post, Query, UsePipes } from '@nestjs/common';
import { NotifyUserAction } from '../notifications/actions/notify-user.action';
import { GetUserPlaylistsAction } from '../playlists/actions/get-user-playlists.action';
import { LoadPlaylistVideosAction } from '../playlists/actions/load-playlist-videos.actions';
import { Playlist } from '../playlists/models/playlist.model';
import { PlaylistResource } from '../playlists/resources/playlist.resource';
import { VideoResource } from '../videos/resources/video.resource';
import { GetUserFlagsAction } from './actions/get-user-flags.action';
import { GetUserVideos } from './actions/get-user-videos.action';
import { SearchUsersAction } from './actions/search-users.action';
import { SubscribeToUserAction } from './actions/subscribe-to-user.action';
import { UnsubscribeFromUserAction } from './actions/unsubscribe-from-user.action';
import { FiltersDto } from './dtos/filters.dto';
import { User } from './models/user.model';
import { SubscriptionNotification } from './notifications/subscription.notification';
import { UserResource } from './resources/user.resource';
import { SearchUsersValidator } from './validators/search-users.validator';

@Controller('/users')
export class UsersController {
    public constructor(
        private readonly videosLoader: GetUserVideos,
        private readonly subscriber: SubscribeToUserAction,
        private readonly unsubscriber: UnsubscribeFromUserAction,
        private readonly playlistsGetter: GetUserPlaylistsAction,
        private readonly playlistVideosLoader: LoadPlaylistVideosAction,
        private readonly usersSearcher: SearchUsersAction,
        private readonly notifier: NotifyUserAction,
        private readonly creatorFlagsGetter: GetUserFlagsAction,
    ) {}

    @Get('/')
    @UsePipes(SearchUsersValidator)
    public async users(@Query() filters: FiltersDto) {
        const users = await this.usersSearcher.run(filters);

        return UserResource.collection(users);
    }

    @Get('/:address')
    public async entity(@Param('address', ResolveModelPipe) user: User) {
        return new UserResource(user);
    }

    @Get('/:address/flags')
    @OptionalJwtAuth()
    public async flags(@CurrentUser() user: User | null, @Param('address', ResolveModelPipe) creator: User) {
        const flags = await this.creatorFlagsGetter.run(user, creator);

        return { flags };
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

        this.notifier.run(creator, new SubscriptionNotification(subscriber));

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

    @Get('/:address/playlists')
    public async playlists(@Param('address', ResolveModelPipe) user: User) {
        const playlists = await this.playlistsGetter.run(user);

        return PlaylistResource.collection(playlists);
    }

    @Get('/:address/playlists/:playlistId')
    public async playlist(
        @Param('address', ResolveModelPipe) user: User,
        @Param('playlistId', ResolveModelUsing.publicId(), ResolveModelPipe) playlist: Playlist,
    ) {
        if (!OwnershipVerifier.verify(user, playlist)) {
            throw new NotFoundException();
        }

        await this.playlistVideosLoader.run(playlist);

        return new PlaylistResource(playlist);
    }
}
