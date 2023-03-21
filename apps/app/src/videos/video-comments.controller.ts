import { ResolveModelPipe } from '@app/core/orm/pipes/resolve-model.pipe';
import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { GetVideoCommentsAction } from '../comments/actions/get-video-comments.action';
import { CommentsFiltersDto } from '../comments/dtos/comments-filters.dto';
import { CommentsSort } from '../comments/enums/comments-sort.enum';
import { CommentResource } from '../comments/resources/comment.resource';
import { CommentsListValidator } from '../comments/validators/comments-list.validator';
import { Video } from './models/video.model';

@Controller('/videos/:publicId/comments')
export class VideoCommentsController {
    public constructor(
        private readonly commentsGetter: GetVideoCommentsAction,
    ) {}

    @Get('/')
    @UsePipes(CommentsListValidator)
    public async list(
        @Param('publicId', ResolveModelPipe) video: Video,
        @Query() filters: CommentsFiltersDto,
    ) {
        const comments = await this.commentsGetter.run(video, CommentsSort[filters.sort]);

        return CommentResource.collection(comments);
    }
}