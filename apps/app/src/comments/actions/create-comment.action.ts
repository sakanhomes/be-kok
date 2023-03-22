import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { randomString, __ } from '@app/core/helpers';
import { ModelLocker } from '@app/core/orm/model-locker';
import { LockService } from '@app/core/support/locker/lock.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Decimal from 'decimal.js';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { Video } from '../../videos/models/video.model';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { Comment } from '../models/comment.model';

@Injectable()
export class CreateCommentAction {
    public constructor(
        private readonly locker: LockService,
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
        @InjectRepository(Comment)
        private readonly comments: Repository<Comment>,
    ) {}

    public async run(user: User, video: Video, data: CreateCommentDto): Promise<Comment> {
        const repliedComment = data.repliedCommentId
            ? await this.getRepliedCommentOrFail(data.repliedCommentId)
            : null;

        let comment = this.comments.create({
            publicId: randomString(16),
            videoId: video.id,
            userId: user.id,
            content: data.content,
            likesAmount: new Decimal(0),
            dislikesAmount: new Decimal(0),
            repliesAmount: new Decimal(0),
            repliedComment,
        });

        let key: string;

        if (repliedComment) {
            key = `comments.reply.${repliedComment.id}`;

            await this.locker.get(key);
        }

        try {
            await ModelLocker.using(this.videos.manager).lock(video, async (manager, video) => {
                comment = await manager.save(comment);

                video.commentsAmount++;

                await manager.save(video);

                if (repliedComment) {
                    repliedComment.repliesAmount = repliedComment.repliesAmount.add(1);

                    await manager.save(repliedComment);
                }
            });

            return comment;
        } finally {
            if (key) {
                this.locker.release(key);
            }
        }
    }

    private async getRepliedCommentOrFail(publicId: string) {
        const comment = await this.comments.findOneBy({ publicId });

        if (comment) {
            return comment;
        }

        throw new UnprocessableException(__('errors.replied-comment-not-found'));
    }
}