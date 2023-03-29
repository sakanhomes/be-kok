import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { JwtAuth } from '@app/core/auth/decorators/jwt-auth.decorator';
import { OwnershipVerifier } from '@app/core/orm/ownership-verifier';
import { ResolveModelPipe, ResolveModelUsing } from '@app/core/orm/pipes/resolve-model.pipe';
import { Controller, Delete, Get, Param, Post, Query, UsePipes } from '@nestjs/common';
import { AddVideoToPlaylistAction } from '../playlists/actions/add-video-to-playlist.action';
import { GetUserPlaylistsAction } from '../playlists/actions/get-user-playlists.action';
import { LoadPlaylistVideosAction } from '../playlists/actions/load-playlist-videos.actions';
import { RemoveVideoFromPlaylistAction } from '../playlists/actions/remove-video-from-playlist.action';
import { ResolvePlaylistAction } from '../playlists/actions/resolve-playlist.action';
import { PlaylistResource } from '../playlists/resources/playlist.resource';
import { NotifyCreatorAboutVideoActivityAction } from '../videos/actions/notify-creator-about-video-activity.action';
import { VideoActivity } from '../videos/enums/video-activity.enum';
import { Video } from '../videos/models/video.model';
import { FiltersDto } from './dtos/filters.dto';
import { User } from './models/user.model';
import { FiltersValidator } from './validators/filters.validator';

@Controller('/me/playlists')
@JwtAuth()
export class ProfilePlaylistsController {
    public constructor(
        private readonly playlistsGetter: GetUserPlaylistsAction,
        private readonly playlistResolver: ResolvePlaylistAction,
        private readonly videosLoader: LoadPlaylistVideosAction,
        private readonly videoAdder: AddVideoToPlaylistAction,
        private readonly videoRemover: RemoveVideoFromPlaylistAction,
        private readonly creatorNotifier: NotifyCreatorAboutVideoActivityAction,
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
        @Param('publicId') publicId: string,
        @Query() filters: FiltersDto,
    ) {
        const playlist = await this.playlistResolver.run(user, publicId);

        OwnershipVerifier.verifyOrFail(user, playlist);

        await this.videosLoader.run(playlist, filters);

        return new PlaylistResource(playlist);
    }

    @Post('/:playlistId/videos/:videoId')
    public async addVideoToPlaylist(
        @CurrentUser() user: User,
        @Param('playlistId') playlistId: string,
        @Param('videoId', ResolveModelUsing.publicId(), ResolveModelPipe) video: Video,
    ) {
        const playlist = await this.playlistResolver.run(user, playlistId);

        OwnershipVerifier.verifyOrFail(user, playlist);

        await this.videoAdder.run(playlist, video);

        this.creatorNotifier.run(video, user, VideoActivity.COLLECTION);
    }

    @Delete('/:playlistId/videos/:videoId')
    public async removeVideoFromPlaylist(
        @CurrentUser() user: User,
        @Param('playlistId') playlistId: string,
        @Param('videoId', ResolveModelUsing.publicId(), ResolveModelPipe) video: Video,
    ) {
        const playlist = await this.playlistResolver.run(user, playlistId);

        OwnershipVerifier.verifyOrFail(user, playlist);

        await this.videoRemover.run(playlist, video);
    }
}