import { CommentReaction } from './enums/comment-reaction.enum';
import { CommentDislike } from './models/comment-dislike.model';
import { CommentLike } from './models/comment-like.model';

export const CommentReactionModels = {
    [CommentReaction.LIKE]: CommentLike,
    [CommentReaction.DISLIKE]: CommentDislike,
};