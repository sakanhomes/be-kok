import { keyBy } from '@app/core/helpers';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { CommentDislike } from '../models/comment-dislike.model';
import { CommentLike } from '../models/comment-like.model';
import { Comment } from '../models/comment.model';
import { CommentCollection } from '../resources/comment.collection';
import { CommentResourceOptions } from '../resources/comment.resource';

@Injectable()
export class CreateCommentResourcesCollectionAction {
    public constructor(
        @InjectRepository(CommentLike)
        private readonly likes: Repository<CommentLike>,
        @InjectRepository(CommentDislike)
        private readonly dislikes: Repository<CommentDislike>,
    ) {}

    public async run(user: User | null, comments: Comment[]): Promise<CommentCollection> {
        const options = user
            ? await this.getCommentsOptionsForUser(user, comments)
            : this.getDefaultOptions(comments.length);

        return new CommentCollection(comments, options);
    }

    private async getCommentsOptionsForUser(user: User, comments: Comment[]): Promise<CommentResourceOptions[]> {
        const commentIds = comments.map(comment => comment.id);
        const search = {
            userId: user.id,
            commentId: In(commentIds),
        };

        const likes = await this.likes.findBy(search).then(likes => keyBy(likes, 'commentId'));
        const dislikes = await this.dislikes.findBy(search).then(dislikes => keyBy(dislikes, 'commentId'));

        const options = comments.map(comment => ({
            flags: {
                isLiked: Boolean(likes[comment.id]),
                isDisliked: Boolean(dislikes[comment.id]),
            },
        }));

        return options;
    }

    private getDefaultOptions(amount: number): CommentResourceOptions[] {
        return new Array(amount).fill({
            flags: {
                isLiked: false,
                isDisliked: false,
            },
        });
    }
}