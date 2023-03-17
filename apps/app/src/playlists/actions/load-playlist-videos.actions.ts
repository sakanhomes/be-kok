import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../videos/models/video.model';
import { PlaylistVideo } from '../models/playlist-video.model';
import { Playlist } from '../models/playlist.model';

@Injectable()
export class LoadPlaylistVideosAction {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
    ) {}

    public async run(playlist: Playlist): Promise<Playlist> {
        playlist.videos = await this.getPlaylistVideos(playlist);

        return playlist;
    }

    private async getPlaylistVideos(playlist: Playlist): Promise<Video[]> {
        return await this.videos.createQueryBuilder('video')
            .innerJoin(PlaylistVideo, 'pv', 'pv.videoId = video.id')
            .where('pv.playlistId = :id', { id: playlist.id })
            .orderBy('pv.addedAt', 'DESC')
            .getMany();
    }
}