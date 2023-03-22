import { randomString } from '@app/core/helpers';
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
        @InjectRepository(Comment)
        private readonly comments: Repository<Comment>,
    ) {}

    public run(user: User, video: Video, content: string): Promise<Comment> {
        const comment = this.comments.create({
            publicId: randomString(16),
            videoId: video.id,
            userId: user.id,
            content,
            likesAmount: new Decimal(0),
            dislikesAmount: new Decimal(0),
            repliesAmount: new Decimal(0),
        });

        return this.comments.save(comment);
    }
}