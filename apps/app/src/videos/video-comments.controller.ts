import { ResolveModelPipe } from '@app/core/orm/pipes/resolve-model.pipe';
import { Controller, Get, Param } from '@nestjs/common';
import { GetVideoCommentsAction } from '../comments/actions/get-video-comments.action';
import { CommentResource } from '../comments/resources/comment.resource';
import { Video } from './models/video.model';

@Controller('/videos/:publicId/comments')
export class VideoCommentsController {
    public constructor(
        private readonly commentsGetter: GetVideoCommentsAction,
    ) {}

    @Get('/')
    public async list(
        @Param('publicId', ResolveModelPipe) video: Video,
    ) {
        const comments = await this.commentsGetter.run(video);

        return CommentResource.collection(comments);
    }
}