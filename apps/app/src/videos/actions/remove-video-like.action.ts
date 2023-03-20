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
export class RemoveVideoLikeAction {
    public constructor(
        private readonly locker: LockService,
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
        @InjectRepository(VideoLike)
        private readonly likes: Repository<VideoLike>,
    ) {}

    public async run(user: User, video: Video): Promise<Video> {
        const key = `videos.likes.remove.${video.id}.${user.id}`;

        await this.locker.get(key);

        try {
            await this.ensureUserLikedVideo(user, video);

            return await ModelLocker.using(this.videos.manager).lock(video, async (manager, video) => {
                const like = await manager.getRepository(VideoLike).findOneBy({
                    videoId: video.id,
                    userId: user.id,
                });

                video.likesAmount = Math.max(video.likesAmount - 1, 0);

                await manager.remove(like);
                await manager.save(video);
            });
        } finally {
            this.locker.release(key);
        }
    }

    private async ensureUserLikedVideo(user: User, video: Video): Promise<void> {
        const likeRecordExists = await this.likes.exist({
            where: {
                videoId: video.id,
                userId: user.id,
            },
        });

        if (!likeRecordExists) {
            throw new UnprocessableException(__('errors.video-isnt-liked'));
        }
    }
}