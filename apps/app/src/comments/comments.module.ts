import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentDislike } from './models/comment-dislike.model';
import { CommentLike } from './models/comment-like.model';
import { Comment } from './models/comment.model';

@Module({
    imports: [TypeOrmModule.forFeature([Comment, CommentLike, CommentDislike])],
})
export class CommentsModule {}
