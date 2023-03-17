import { NotFoundException } from '@app/core/exceptions/app/not-found.exception';
import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { __ } from '@app/core/helpers';
import { LockService } from '@app/core/support/locker/lock.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../videos/models/video.model';
import { PlaylistVideo } from '../models/playlist-video.model';
import { Playlist } from '../models/playlist.model';

export class RemoveVideoFromPlaylistAction {
    public constructor(
        private readonly locker: LockService,
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
        @InjectRepository(PlaylistVideo)
        private readonly playlistVideos: Repository<PlaylistVideo>,
    ) {}

    public async run(playlist: Playlist, video: Video): Promise<void> {
        this.ensureVideoIsPublic(video);

        const key = `playlists.videos.remove.${playlist.id}.${video.id}`;

        await this.locker.get(key);

        try {
            const playlistVideo = await this.getPlaylistVideoOrFail(playlist, video);

            await this.playlistVideos.remove(playlistVideo);
        } finally {
            this.locker.release(key);
        }
    }

    private ensureVideoIsPublic(video: Video): void {
        if (!video.isPublic) {
            throw new NotFoundException(__('errors.video-not-found'));
        }
    }

    private async getPlaylistVideoOrFail(playlist: Playlist, video: Video): Promise<PlaylistVideo> {
        const playlistVideo = await this.playlistVideos.findOneBy({
            playlistId: playlist.id,
            videoId: video.id,
        });

        if (!playlistVideo) {
            throw new UnprocessableException(__('errors.video-isnt-in-playlist'));
        }

        return playlistVideo;
    }
}