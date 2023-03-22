import { ResourceCollection } from '@app/core/http/resources/resource-collection';
import { Comment } from '../models/comment.model';
import { CommentResource, CommentResourceOptions } from './comment.resource';

export class CommentCollection extends ResourceCollection {
    public wrap = 'comments';

    public constructor(comments: Comment[], private readonly options: CommentResourceOptions[]) {
        super(CommentResource, comments);
    }

    public data(): Record<string, any> {
        return this.items.map((comment, index) => new this.resource(comment, this.options[index]).data());
    }
}