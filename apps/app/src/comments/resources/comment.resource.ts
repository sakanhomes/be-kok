import { Resource } from '@app/core/http/resources/resource';
import { User } from '../../users/models/user.model';
import { BasicUserResource } from '../../users/resources/basic-user.resource';
import { Comment } from '../models/comment.model';

export type CommentFlags = {
    isLiked: boolean,
    isDisliked: boolean,
}

export type CommentResourceOptions = {
    user?: User,
    flags?: CommentFlags,
}

export class CommentResource extends Resource {
    public static wrap = 'comment';

    public constructor(private readonly comment: Comment, private readonly options?: CommentResourceOptions) {
        super();
    }

    public data(): Record<string, any> {
        const user = this.options?.user ?? this.comment.user ?? null;

        return {
            id: this.comment.publicId,
            content: this.comment.content,
            likesAmount: this.comment.likesAmount.toNumber(),
            dislikesAmount: this.comment.dislikesAmount.toNumber(),
            repliesAmount: this.comment.repliesAmount.toNumber(),
            user: user ? new BasicUserResource(user).data() : undefined,
            flags: this.options?.flags ? this.options.flags : undefined,
        };
    }
}