import { NotFoundException } from '@app/core/exceptions/app/not-found.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { Video } from '../../videos/models/video.model';
import { Playlist } from '../models/playlist.model';
import { GetDefaultPlaylistAction } from './get-default-playlist.action';
import { LoadPlaylistVideosAction } from './load-playlist-videos.actions';

@Injectable()
export class GetUserPlaylistAction {
    public constructor(
        @InjectRepository(Playlist)
        private readonly playlists: Repository<Playlist>,
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
        private readonly defaultPlaylistGetter: GetDefaultPlaylistAction,
        private readonly videosLoader: LoadPlaylistVideosAction,
    ) {}

    public async run(user: User, publicId: string): Promise<Playlist> {
        let playlist: Playlist;

        if (publicId === 'default') {
            playlist = await this.defaultPlaylistGetter.run(user);
            playlist.videos = [];
        } else {
            playlist = await this.getPlaylistOrFail(user, publicId);
            await this.videosLoader.run(playlist);
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
}