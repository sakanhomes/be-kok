import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { OptionalJwtAuth } from '@app/core/auth/decorators/optional-jwt-auth.decorator';
import { ResolveModelPipe } from '@app/core/orm/pipes/resolve-model.pipe';
import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { CreateCommentResourcesCollectionAction } from '../comments/actions/create-comment-resources-collection.action';
import { GetVideoCommentsAction } from '../comments/actions/get-video-comments.action';
import { CommentsFiltersDto } from '../comments/dtos/comments-filters.dto';
import { CommentsSort } from '../comments/enums/comments-sort.enum';
import { CommentsListValidator } from '../comments/validators/comments-list.validator';
import { User } from '../users/models/user.model';
import { Video } from './models/video.model';

@Controller('/videos/:publicId/comments')
export class VideoCommentsController {
    public constructor(
        private readonly commentsGetter: GetVideoCommentsAction,
        private readonly commentsCollectionCreator: CreateCommentResourcesCollectionAction,
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
}