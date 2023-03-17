import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { JwtAuth } from '@app/core/auth/decorators/jwt-auth.decorator';
import { OptionalJwtAuth } from '@app/core/auth/decorators/optional-jwt-auth.decorator';
import { NotFoundException } from '@app/core/exceptions/app/not-found.exception';
import { OwnershipVerifier } from '@app/core/orm/ownership-verifier';
import { ResolveModelPipe, ResolveModelUsing } from '@app/core/orm/pipes/resolve-model.pipe';
import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { GetUserPlaylistsAction } from '../playlists/actions/get-user-playlists.action';
import { LoadPlaylistVideosAction } from '../playlists/actions/load-playlist-videos.actions';
import { Playlist } from '../playlists/models/playlist.model';
import { PlaylistResource } from '../playlists/resources/playlist.resource';
import { VideoResource } from '../videos/resources/video.resource';
import { GetUserVideos } from './actions/get-user-videos.action';
import { SubscribeToUserAction } from './actions/subscribe-to-user.action';
import { UnsubscribeFromUserAction } from './actions/unsubscribe-from-user.action';
import { User } from './models/user.model';
import { UserResource } from './resources/user.resource';

@Controller('users')
export class UsersController {
    public constructor(
        private readonly videosLoader: GetUserVideos,
        private readonly subscriber: SubscribeToUserAction,
        private readonly unsubscriber: UnsubscribeFromUserAction,
        private readonly playlistsGetter: GetUserPlaylistsAction,
        private readonly playlistVideosLoader: LoadPlaylistVideosAction,
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
