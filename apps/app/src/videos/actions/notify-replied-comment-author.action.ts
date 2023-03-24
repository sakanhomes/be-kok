import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { __ } from '@app/core/helpers';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../comments/models/comment.model';
import { NotifyUserAction } from '../../notifications/actions/notify-user.action';
import { User } from '../../users/models/user.model';
import { Video } from '../models/video.model';
import { MentionNotification } from '../notifications/mention.notification';

@Injectable()
export class NotifyRepliedCommentAuthorAction {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private readonly notifier: NotifyUserAction,
    ) {}

    public async run(comment: Comment, video: Video, user: User): Promise<void> {
        if (!comment.repliedCommentId) {
            throw new UnprocessableException(__('errors.comment-isnt-reply'));
        }

        const repliedCommentAuthor = await this.getRepliedCommentAuthor(comment);

        await this.notifier.run(repliedCommentAuthor, new MentionNotification(user, video));
    }

    private getRepliedCommentAuthor(comment: Comment): Promise<User> {
        return this.users.createQueryBuilder('user')
            .innerJoin(Comment, 'comment', 'comment.userId = user.id')
            .where('comment.id  = :id', { id: comment.repliedCommentId })
            .getOne();
    }
}