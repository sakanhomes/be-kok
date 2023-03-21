import { Resource } from '@app/core/http/resources/resource';
import { BasicUserResource } from '../../users/resources/basic-user.resource';
import { Comment } from '../models/comment.model';

export class CommentResource extends Resource {
    public static wrap = 'comment';

    // TODO Add flags
    public constructor(private readonly comment: Comment) {
        super();
    }

    public data(): Record<string, any> {
        return {
            id: this.comment.publicId,
            content: this.comment.content,
            likesAmount: this.comment.likesAmount.toNumber(),
            dislikesAmount: this.comment.dislikesAmount.toNumber(),
            repliesAmount: this.comment.repliesAmount.toNumber(),
            user: this.comment.user ? new BasicUserResource(this.comment.user).data() : undefined,
        };
    }
}