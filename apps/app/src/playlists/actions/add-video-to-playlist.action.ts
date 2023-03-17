import { NotFoundException } from '@app/core/exceptions/app/not-found.exception';
import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { __ } from '@app/core/helpers';
import { LockService } from '@app/core/support/locker/lock.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../videos/models/video.model';
import { PlaylistVideo } from '../models/playlist-video.model';
import { Playlist } from '../models/playlist.model';

export class AddVideoToPlaylistAction {
    public constructor(
        private readonly locker: LockService,
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
        @InjectRepository(PlaylistVideo)
        private readonly playlistVideos: Repository<PlaylistVideo>,
    ) {}

    public async run(playlist: Playlist, videoId: string): Promise<void> {
        const video = await this.getVideoOrFail(videoId);
        const key = `playlists.videos.add.${playlist.id}.${video.id}`;

        await this.locker.get(key);

        try {
            await this.ensureVideoIsntInPlaylist(playlist, video);

            const playlistVideo = this.playlistVideos.create({
                playlistId: playlist.id,
                videoId: video.id,
            });

            await this.playlistVideos.save(playlistVideo);
        } finally {
            this.locker.release(key);
        }
    }

    private async getVideoOrFail(publicId: string): Promise<Video> {
        const video = await this.videos.findOneBy({
            publicId,
            isPublic: true,
        });

        if (!video) {
            throw new NotFoundException(__('errors.video-not-found'));
        }

        return video;
    }

    private async ensureVideoIsntInPlaylist(playlist: Playlist, video: Video): Promise<void> {
        const exists = await this.playlistVideos.exist({
            where: {
                playlistId: playlist.id,
                videoId: video.id,
            },
        });

        if (exists) {
            throw new UnprocessableException(__('errors.video-already-in-playlist'));
        }
    }
}