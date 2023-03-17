import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { JwtAuth } from '@app/core/auth/decorators/jwt-auth.decorator';
import { Controller, Get, Param } from '@nestjs/common';
import { GetUserPlaylistAction } from '../playlists/actions/get-user-playlist.action';
import { PlaylistResource } from '../playlists/resources/playlist.resource';
import { User } from './models/user.model';

@Controller('/me/playlists')
@JwtAuth()
export class ProfilePlaylistsController {
    public constructor(
        private readonly playlistGetter: GetUserPlaylistAction,
    ) {}

    @Get('/:publicId')
    public async entity(@CurrentUser() user: User, @Param('publicId') publicId: string) {
        const playlist = await this.playlistGetter.run(user, publicId);

        return new PlaylistResource(playlist);
    }
}