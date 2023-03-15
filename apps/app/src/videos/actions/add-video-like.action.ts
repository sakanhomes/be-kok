import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { __ } from '@app/core/helpers';
import { ModelLocker } from '@app/core/orm/model-locker';
import { LockService } from '@app/core/support/locker/lock.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { VideoLike } from '../models/video-like.model';
import { Video } from '../models/video.model';

@Injectable()
export class AddVideoLikeAction {
    public constructor(
        private readonly locker: LockService,
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
        @InjectRepository(VideoLike)
        private readonly likes: Repository<VideoLike>,
    ) {}

    public async run(user: User, video: Video): Promise<Video> {
        await this.ensureUserDidntLikeVideo(user, video);

        const key = `videos.likes.add.${video.id}.${user.id}`;

        await this.locker.get(key);

        try {
            return await ModelLocker.using(this.videos.manager).lock(video, async (manager, video) => {
                await this.ensureUserDidntLikeVideo(user, video);

                const like = this.likes.create({
                    videoId: video.id,
                    userId: user.id,
                });

                video.likesAmount++;

                await manager.save(like);
                await manager.save(video);
            });
        } finally {
            this.locker.release(key);
        }
    }

    private async ensureUserDidntLikeVideo(user: User, video: Video): Promise<void> {
        const likeRecordExists = await this.likes.exist({
            where: {
                videoId: video.id,
                userId: user.id,
            },
        });

        if (likeRecordExists) {
            throw new UnprocessableException(__('errors.video-already-liked'));
        }
    }
}