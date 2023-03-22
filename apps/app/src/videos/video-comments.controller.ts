import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { JwtAuth } from '@app/core/auth/decorators/jwt-auth.decorator';
import { OptionalJwtAuth } from '@app/core/auth/decorators/optional-jwt-auth.decorator';
import { ResolveModelPipe, ResolveModelUsing } from '@app/core/orm/pipes/resolve-model.pipe';
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UsePipes } from '@nestjs/common';
import { CreateCommentResourceAction } from '../comments/actions/create-comment-resource.action';
import { CreateCommentResourcesCollectionAction } from '../comments/actions/create-comment-resources-collection.action';
import { CreateCommentAction } from '../comments/actions/create-comment.action';
import { GetVideoCommentsAction } from '../comments/actions/get-video-comments.action';
import { AddReactionToCommentAction } from '../comments/actions/add-reaction-to-comment.action';
import { CommentsFiltersDto } from '../comments/dtos/comments-filters.dto';
import { CommentsSort } from '../comments/enums/comments-sort.enum';
import { Comment } from '../comments/models/comment.model';
import { CommentResource } from '../comments/resources/comment.resource';
import { CommentsListValidator } from '../comments/validators/comments-list.validator';
import { CreateCommentValdiator } from '../comments/validators/create-comment.validator';
import { User } from '../users/models/user.model';
import { Video } from './models/video.model';
import { CommentReaction } from '../comments/enums/comment-reaction.enum';
import { RemoveReactionFromCommentAction } from '../comments/actions/remove-reaction-from-comment.action';

@Controller('/videos/:publicId/comments')
export class VideoCommentsController {
    public constructor(
        private readonly resourceCreator: CreateCommentResourceAction,
        private readonly commentsGetter: GetVideoCommentsAction,
        private readonly commentsCollectionCreator: CreateCommentResourcesCollectionAction,
        private readonly commentCreator: CreateCommentAction,
        private readonly commentReactionAdder: AddReactionToCommentAction,
        private readonly commentReactionRemover: RemoveReactionFromCommentAction,
    ) {}

    @Get('/')
    @UsePipes(CommentsListValidator)
    @OptionalJwtAuth()
    public async list(
        @CurrentUser() user: User | null,
        @Param('publicId', ResolveModelPipe) video: Video,
        @Query() filters: CommentsFiltersDto,
    ) {
        const comments = await this.commentsGetter.run(video, CommentsSort[filters.sort]);
        const collection = await this.commentsCollectionCreator.run(user, comments);

        return collection;
    }

    @Post('/')
    @HttpCode(200)
    @UsePipes(CreateCommentValdiator)
    @JwtAuth()
    public async create(
        @CurrentUser() user: User,
        @Param('publicId', ResolveModelPipe) video: Video,
        @Body() { content }: {content: string},
    ) {
        const comment = await this.commentCreator.run(user, video, content);

        return new CommentResource(comment, {
            user,
            flags: {
                isLiked: false,
                isDisliked: false,
            },
        });
    }

    @Post('/:commentId/likes')
    @HttpCode(200)
    @JwtAuth()
    public async likeComment(
        @CurrentUser() user: User,
        @Param('commentId', ResolveModelUsing.publicId(), ResolveModelPipe) comment: Comment,
    ) {
        comment = await this.commentReactionAdder.run(user, comment, CommentReaction.LIKE);

        return this.resourceCreator.run(user, comment);
    }

    @Delete('/:commentId/likes')
    @JwtAuth()
    public async unlikeComment(
        @CurrentUser() user: User,
        @Param('commentId', ResolveModelUsing.publicId(), ResolveModelPipe) comment: Comment,
    ) {
        comment = await this.commentReactionRemover.run(user, comment, CommentReaction.LIKE);

        return this.resourceCreator.run(user, comment);
    }

    @Post('/:commentId/dislikes')
    @HttpCode(200)
    @JwtAuth()
    public async dislikeComment(
        @CurrentUser() user: User,
        @Param('commentId', ResolveModelUsing.publicId(), ResolveModelPipe) comment: Comment,
    ) {
        comment = await this.commentReactionAdder.run(user, comment, CommentReaction.DISLIKE);

        return this.resourceCreator.run(user, comment);
    }

    @Delete('/:commentId/dislikes')
    @JwtAuth()
    public async undislikeComment(
        @CurrentUser() user: User,
        @Param('commentId', ResolveModelUsing.publicId(), ResolveModelPipe) comment: Comment,
    ) {
        comment = await this.commentReactionRemover.run(user, comment, CommentReaction.DISLIKE);

        return this.resourceCreator.run(user, comment);
    }
}