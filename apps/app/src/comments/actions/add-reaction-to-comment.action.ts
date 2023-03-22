import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { maxDecimal, __ } from '@app/core/helpers';
import { ModelLocker } from '@app/core/orm/model-locker';
import { LockService } from '@app/core/support/locker/lock.service';
import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { EntityManager } from 'typeorm';
import { User } from '../../users/models/user.model';
import { CommentReactionModels } from '../comment-reaction.models';
import { CommentReaction } from '../enums/comment-reaction.enum';
import { getReactionCounterProperty } from '../helpers';
import { Comment } from '../models/comment.model';

@Injectable()
export class AddReactionToCommentAction {
    public constructor(
        private readonly locker: LockService,
        private readonly manager: EntityManager,
    ) {}

    public async run(user: User, comment: Comment, reaction: CommentReaction): Promise<Comment> {
        await this.ensureCommentDoesntHaveReaction(comment, user, reaction);

        const key = `comments.${reaction}.add.${comment.id}.${user.id}`;

        await this.locker.get(key);

        const oppositeReaction = reaction === CommentReaction.LIKE ? CommentReaction.DISLIKE : CommentReaction.LIKE;
        const reactionCounterProperty = getReactionCounterProperty(reaction);
        const oppositeReactionCounterProperty = getReactionCounterProperty(oppositeReaction);

        try {
            return await ModelLocker.using(this.manager).lock(comment, async (manager, comment) => {
                await this.ensureCommentDoesntHaveReaction(comment, user, reaction);

                const reactionModel = manager.getRepository(CommentReactionModels[reaction]).create({
                    commentId: comment.id,
                    userId: user.id,
                });

                const oppositeReactionModel = await manager.getRepository(CommentReactionModels[oppositeReaction])
                    .findOneBy({
                        commentId: comment.id,
                        userId: user.id,
                    });

                comment[reactionCounterProperty] = comment[reactionCounterProperty].add(1);

                if (oppositeReactionModel) {
                    comment[oppositeReactionCounterProperty] = maxDecimal(
                        comment[oppositeReactionCounterProperty].sub(1),
                        new Decimal(0),
                    );

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
        const exists = await this.manager.getRepository(CommentReactionModels[reaction]).exist({
            where: {
                commentId: comment.id,
                userId: user.id,
            },
        });

        if (exists) {
            throw new UnprocessableException(__('errors.comment-reaction-already-added'));
        }
    }
}