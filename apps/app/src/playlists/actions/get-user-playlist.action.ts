import { NotFoundException } from '@app/core/exceptions/app/not-found.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { Video } from '../../videos/models/video.model';
import { PlaylistVideo } from '../models/playlist-video.model';
import { Playlist } from '../models/playlist.model';
import { GetDefaultPlaylistAction } from './get-default-playlist.action';

@Injectable()
export class GetUserPlaylistAction {
    public constructor(
        @InjectRepository(Playlist)
        private readonly playlists: Repository<Playlist>,
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
        private readonly defaultPlaylistGetter: GetDefaultPlaylistAction,
    ) {}

    public async run(user: User, publicId: string): Promise<Playlist> {
        let playlist: Playlist;

        if (publicId === 'default') {
            playlist = await this.defaultPlaylistGetter.run(user);
            playlist.videos = [];
        } else {
            playlist = await this.getPlaylistOrFail(user, publicId);
            playlist.videos = await this.getPlaylistVideos(playlist);
        }

        return playlist;
    }

    private async getPlaylistOrFail(user: User, publicId: string): Promise<Playlist> {
        const playlist = await this.playlists.findOneBy({
            publicId,
            userId: user.id,
        });

        if (!playlist) {
            throw new NotFoundException();
        }

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