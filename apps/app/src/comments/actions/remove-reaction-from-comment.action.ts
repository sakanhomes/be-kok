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
export class RemoveReactionFromCommentAction {
    public constructor(
        private readonly locker: LockService,
        private readonly manager: EntityManager,
    ) {}

    public async run(user: User, comment: Comment, reaction: CommentReaction): Promise<Comment> {
        await this.ensureReactionExists(comment, user, reaction);

        const key = `comments.${reaction}.remove.${comment.id}.${user.id}`;

        await this.locker.get(key);

        const reactionCounterProperty = getReactionCounterProperty(reaction);

        try {
            return await ModelLocker.using(this.manager).lock(comment, async (manager, comment) => {
                const reactionModel = await manager.getRepository(CommentReactionModels[reaction]).findOneBy({
                    commentId: comment.id,
                    userId: user.id,
                });

                if (!reactionModel) {
                    throw new UnprocessableException(__('erros.comment-reaction-isnt-added'));
                }

                comment[reactionCounterProperty] = maxDecimal(
                    comment[reactionCounterProperty].sub(1),
                    new Decimal(0),
                );

                await manager.remove(reactionModel);
                await manager.save(comment);
            });
        } finally {
            this.locker.release(key);
        }
    }

    private async ensureReactionExists(comment: Comment, user: User, reaction: CommentReaction): Promise<void> {
        const exists = await this.manager.getRepository(CommentReactionModels[reaction]).exist({
            where: {
                commentId: comment.id,
                userId: user.id,
            },
        });

        if (!exists) {
            throw new UnprocessableException(__('errors.comment-reaction-isnt-added'));
        }
    }
}