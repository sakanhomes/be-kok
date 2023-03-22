import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { CommentDislike } from '../models/comment-dislike.model';
import { CommentLike } from '../models/comment-like.model';
import { Comment } from '../models/comment.model';
import { CommentFlags, CommentResource } from '../resources/comment.resource';

@Injectable()
export class CreateCommentResourceAction {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        @InjectRepository(CommentLike)
        private readonly likes: Repository<CommentLike>,
        @InjectRepository(CommentDislike)
        private readonly dislikes: Repository<CommentDislike>,
    ) {}

    public async run(user: User | null, comment: Comment): Promise<CommentResource> {
        const author = comment.user
            ? comment.user
            : await this.getCommentAuthor(comment);
        const flags = user
            ? await this.getCommentFlagsForUser(user, comment)
            : this.getDefaultFlags();

        return new CommentResource(comment, { user: author, flags });
    }

    private getCommentAuthor(comment: Comment): Promise<User> {
        return this.users.findOneBy({
            id: comment.userId,
        });
    }

    private async getCommentFlagsForUser(user: User, comment: Comment): Promise<CommentFlags> {
        const search = {
            where: {
                commentId: comment.id,
                userId: user.id,
            },
        };

        return {
            isLiked: await this.likes.exist(search),
            isDisliked: await this.dislikes.exist(search),
        };
    }

    private getDefaultFlags(): CommentFlags {
        return {
            isLiked: false,
            isDisliked: false,
        };
    }
}