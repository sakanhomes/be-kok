import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from '../videos/models/video.model';
import { GetDefaultPlaylistAction } from './actions/get-default-playlist.action';
import { GetUserPlaylistAction } from './actions/get-user-playlist.action';
import { PlaylistVideo } from './models/playlist-video.model';
import { Playlist } from './models/playlist.model';

@Module({
    imports: [TypeOrmModule.forFeature([Playlist, PlaylistVideo, Video])],
    providers: [
        GetDefaultPlaylistAction,
        GetUserPlaylistAction,
    ],
    exports: [
        GetUserPlaylistAction,
    ],
})
export class PlaylistsModule {}
