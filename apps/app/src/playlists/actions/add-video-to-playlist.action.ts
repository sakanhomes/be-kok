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
        @InjectRepository(PlaylistVideo)
        private readonly playlistVideos: Repository<PlaylistVideo>,
    ) {}

    public async run(playlist: Playlist, video: Video): Promise<void> {
        this.ensureVideoIsPublic(video);

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

    private ensureVideoIsPublic(video: Video): void {
        if (!video.isPublic) {
            throw new NotFoundException();
        }
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