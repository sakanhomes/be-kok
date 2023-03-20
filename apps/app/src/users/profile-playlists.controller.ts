import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { JwtAuth } from '@app/core/auth/decorators/jwt-auth.decorator';
import { OwnershipVerifier } from '@app/core/orm/ownership-verifier';
import { ResolveModelPipe, ResolveModelUsing } from '@app/core/orm/pipes/resolve-model.pipe';
import { Controller, Delete, Get, Param, Post, Query, UsePipes } from '@nestjs/common';
import { AddVideoToPlaylistAction } from '../playlists/actions/add-video-to-playlist.action';
import { GetUserPlaylistsAction } from '../playlists/actions/get-user-playlists.action';
import { LoadPlaylistVideosAction } from '../playlists/actions/load-playlist-videos.actions';
import { RemoveVideoFromPlaylistAction } from '../playlists/actions/remove-video-from-playlist.action';
import { Playlist } from '../playlists/models/playlist.model';
import { PlaylistResource } from '../playlists/resources/playlist.resource';
import { Video } from '../videos/models/video.model';
import { FiltersDto } from './dtos/filters.dto';
import { User } from './models/user.model';
import { FiltersValidator } from './validators/filters.validator';

@Controller('/me/playlists')
@JwtAuth()
export class ProfilePlaylistsController {
    public constructor(
        private readonly playlistsGetter: GetUserPlaylistsAction,
        private readonly videosLoader: LoadPlaylistVideosAction,
        private readonly videoAdder: AddVideoToPlaylistAction,
        private readonly videoRemover: RemoveVideoFromPlaylistAction,
    ) {}

    @Get('/')
    public async list(@CurrentUser() user: User) {
        const playlists = await this.playlistsGetter.run(user);

        return PlaylistResource.collection(playlists);
    }

    @Get('/:publicId')
    @UsePipes(FiltersValidator)
    public async entity(
        @CurrentUser() user: User,
        @Param('publicId', ResolveModelPipe) playlist: Playlist,
        @Query() filters: FiltersDto,
    ) {
        OwnershipVerifier.verifyOrFail(user, playlist);

        await this.videosLoader.run(playlist, filters);

        return new PlaylistResource(playlist);
    }

    @Post('/:playlistId/videos/:videoId')
    public async addVideoToPlaylist(
        @CurrentUser() user: User,
        @Param('playlistId', ResolveModelUsing.publicId(), ResolveModelPipe) playlist: Playlist,
        @Param('videoId', ResolveModelUsing.publicId(), ResolveModelPipe) video: Video,
    ) {
        OwnershipVerifier.verifyOrFail(user, playlist);

        await this.videoAdder.run(playlist, video);
    }

    @Delete('/:playlistId/videos/:videoId')
    public async removeVideoFromPlaylist(
        @CurrentUser() user: User,
        @Param('playlistId', ResolveModelUsing.publicId(), ResolveModelPipe) playlist: Playlist,
        @Param('videoId', ResolveModelUsing.publicId(), ResolveModelPipe) video: Video,
    ) {
        OwnershipVerifier.verifyOrFail(user, playlist);

        await this.videoRemover.run(playlist, video);
    }
}