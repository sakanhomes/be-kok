import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/models/user.model';
import { Video } from '../videos/models/video.model';
import { CreateCommentResourceAction } from './actions/create-comment-resource.action';
import { CreateCommentResourcesCollectionAction } from './actions/create-comment-resources-collection.action';
import { CreateCommentAction } from './actions/create-comment.action';
import { GetVideoCommentsAction } from './actions/get-video-comments.action';
import { AddReactionToCommentAction } from './actions/add-reaction-to-comment.action';
import { CommentDislike } from './models/comment-dislike.model';
import { CommentLike } from './models/comment-like.model';
import { Comment } from './models/comment.model';
import { RemoveReactionFromCommentAction } from './actions/remove-reaction-from-comment.action';

@Module({
    imports: [TypeOrmModule.forFeature([Comment, CommentLike, CommentDislike, User, Video])],
    providers: [
        GetVideoCommentsAction,
        CreateCommentResourcesCollectionAction,
        CreateCommentAction,
        CreateCommentResourceAction,
        AddReactionToCommentAction,
        RemoveReactionFromCommentAction,
    ],
    exports: [
        GetVideoCommentsAction,
        CreateCommentResourcesCollectionAction,
        CreateCommentAction,
        CreateCommentResourceAction,
        AddReactionToCommentAction,
        RemoveReactionFromCommentAction,
    ],
})
export class CommentsModule {}
