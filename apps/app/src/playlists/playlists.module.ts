import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaylistVideo } from './models/playlist-video.model';
import { Playlist } from './models/playlist.model';

@Module({
    imports: [TypeOrmModule.forFeature([Playlist, PlaylistVideo])],
})
export class PlaylistsModule {}
