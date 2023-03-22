import { plural } from 'pluralize';
import { CommentReaction } from './enums/comment-reaction.enum';

export function getReactionCounterProperty(reaction: CommentReaction): string {
    return plural(reaction) + 'Amount';
}