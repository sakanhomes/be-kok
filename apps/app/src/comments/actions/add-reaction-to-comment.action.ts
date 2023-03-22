import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { __ } from '@app/core/helpers';
import { ModelLocker } from '@app/core/orm/model-locker';
import { LockService } from '@app/core/support/locker/lock.service';
import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { plural } from 'pluralize';
import { EntityManager } from 'typeorm';
import { User } from '../../users/models/user.model';
import { CommentReaction } from '../enums/comment-reaction.enum';
import { CommentDislike } from '../models/comment-dislike.model';
import { CommentLike } from '../models/comment-like.model';
import { Comment } from '../models/comment.model';

@Injectable()
export class AddReactionToCommentAction {
    private reactionModels = {
        [CommentReaction.LIKE]: CommentLike,
        [CommentReaction.DISLIKE]: CommentDislike,
    };

    public constructor(
        private readonly locker: LockService,
        private readonly manager: EntityManager,
    ) {}

    public async run(user: User, comment: Comment, reaction: CommentReaction): Promise<Comment> {
        await this.ensureCommentDoesntHaveReaction(comment, user, reaction);

        const key = `comments.${reaction}.add.${comment.id}.${user.id}`;

        await this.locker.get(key);

        const oppositeReaction = reaction === CommentReaction.LIKE ? CommentReaction.DISLIKE : CommentReaction.LIKE;
        const reactionCounterProperty = this.getReactionCounterProperty(reaction);
        const oppositeReactionCounterProperty = this.getReactionCounterProperty(oppositeReaction);

        try {
            return await ModelLocker.using(this.manager).lock(comment, async (manager, comment) => {
                await this.ensureCommentDoesntHaveReaction(comment, user, reaction);

                const reactionModel = manager.getRepository(this.reactionModels[reaction]).create({
                    commentId: comment.id,
                    userId: user.id,
                });

                const oppositeReactionModel = await manager.getRepository(this.reactionModels[oppositeReaction])
                    .findOneBy({
                        commentId: comment.id,
                        userId: user.id,
                    });

                comment[reactionCounterProperty] = comment[reactionCounterProperty].add(1);

                if (oppositeReactionModel) {
                    comment[oppositeReactionCounterProperty] = comment[oppositeReactionCounterProperty].sub(1);

                    if (comment[oppositeReactionCounterProperty].lessThan(0)) {
                        comment[oppositeReactionCounterProperty] = new Decimal(0);
                    }

                    await manager.remove(oppositeReactionModel);
                }

                await manager.save(reactionModel);
                await manager.save(comment);
            });
        } finally {
            this.locker.release(key);
        }
    }

    private async ensureCommentDoesntHaveReaction(
        comment: Comment,
        user: User,
        reaction: CommentReaction,
    ): Promise<void> {
        const model = this.reactionModels[reaction];
        const exists = await this.manager.getRepository(model).exist({
            where: {
                commentId: comment.id,
                userId: user.id,
            },
        });

        if (exists) {
            throw new UnprocessableException(__('errors.comment-reaction-already-added'));
        }
    }

    private getReactionCounterProperty(reaction: CommentReaction): string {
        return plural(reaction) + 'Amount';
    }
}