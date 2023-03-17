import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from '../videos/models/video.model';
import { AddVideoToPlaylistAction } from './actions/add-video-to-playlist.action';
import { GetDefaultPlaylistAction } from './actions/get-default-playlist.action';
import { GetUserPlaylistsAction } from './actions/get-user-playlists.action';
import { LoadPlaylistVideosAction } from './actions/load-playlist-videos.actions';
import { RemoveVideoFromPlaylistAction } from './actions/remove-video-from-playlist.action';
import { PlaylistVideo } from './models/playlist-video.model';
import { Playlist } from './models/playlist.model';

@Module({
    imports: [TypeOrmModule.forFeature([Playlist, PlaylistVideo, Video])],
    providers: [
        GetDefaultPlaylistAction,
        GetUserPlaylistsAction,
        LoadPlaylistVideosAction,
        AddVideoToPlaylistAction,
        RemoveVideoFromPlaylistAction,
    ],
    exports: [
        GetUserPlaylistsAction,
        LoadPlaylistVideosAction,
        AddVideoToPlaylistAction,
        RemoveVideoFromPlaylistAction,
    ],
})
export class PlaylistsModule {}
