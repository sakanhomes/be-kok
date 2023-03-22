import { randomString } from '@app/core/helpers';
import { ModelLocker } from '@app/core/orm/model-locker';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Decimal from 'decimal.js';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { Video } from '../../videos/models/video.model';
import { Comment } from '../models/comment.model';

@Injectable()
export class CreateCommentAction {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
        @InjectRepository(Comment)
        private readonly comments: Repository<Comment>,
    ) {}

    public async run(user: User, video: Video, content: string): Promise<Comment> {
        let comment = this.comments.create({
            publicId: randomString(16),
            videoId: video.id,
            userId: user.id,
            content,
            likesAmount: new Decimal(0),
            dislikesAmount: new Decimal(0),
            repliesAmount: new Decimal(0),
        });

        await ModelLocker.using(this.videos.manager).lock(video, async (manager, video) => {
            comment = await manager.save(comment);

            video.commentsAmount++;

            await manager.save(video);
        });

        return comment;
    }
}