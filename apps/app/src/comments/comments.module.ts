import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetVideoCommentsAction } from './actions/get-video-comments.action';
import { CommentDislike } from './models/comment-dislike.model';
import { CommentLike } from './models/comment-like.model';
import { Comment } from './models/comment.model';

@Module({
    imports: [TypeOrmModule.forFeature([Comment, CommentLike, CommentDislike])],
    providers: [
        GetVideoCommentsAction,
    ],
    exports: [
        GetVideoCommentsAction,
    ],
})
export class CommentsModule {}
