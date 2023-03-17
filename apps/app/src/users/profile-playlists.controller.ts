import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { JwtAuth } from '@app/core/auth/decorators/jwt-auth.decorator';
import { Controller, Get, Param, Post } from '@nestjs/common';
import { AddVideoToPlaylistAction } from '../playlists/actions/add-video-to-playlist.action';
import { GetUserPlaylistAction } from '../playlists/actions/get-user-playlist.action';
import { LoadPlaylistVideosAction } from '../playlists/actions/load-playlist-videos.actions';
import { PlaylistResource } from '../playlists/resources/playlist.resource';
import { User } from './models/user.model';

@Controller('/me/playlists')
@JwtAuth()
export class ProfilePlaylistsController {
    public constructor(
        private readonly playlistGetter: GetUserPlaylistAction,
        private readonly videosLoader: LoadPlaylistVideosAction,
        private readonly videoAdder: AddVideoToPlaylistAction,
    ) {}

    @Get('/:publicId')
    public async entity(@CurrentUser() user: User, @Param('publicId') publicId: string) {
        const playlist = await this.playlistGetter.run(user, publicId);

        await this.videosLoader.run(playlist);

        return new PlaylistResource(playlist);
    }

    @Post('/:playlistId/videos/:videoId')
    public async addVideoToPlaylist(
        @CurrentUser() user: User,
        @Param('playlistId') playlistId: string,
        @Param('videoId') videoId: string,
    ) {
        const playlist = await this.playlistGetter.run(user, playlistId);

        await this.videoAdder.run(playlist, videoId);
    }
}