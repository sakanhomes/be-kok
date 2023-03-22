import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../videos/models/video.model';
import { CommentsSort } from '../enums/comments-sort.enum';
import { Comment } from '../models/comment.model';

@Injectable()
export class GetVideoCommentsAction {
    public constructor(
        @InjectRepository(Comment)
        private readonly comments: Repository<Comment>,
    ) {}

    public run(video: Video, sort?: CommentsSort): Promise<Comment[]> {
        const orderColumn = sort === CommentsSort.top ? 'likesAmount' : 'createdAt';

        return this.comments.find({
            where: {
                videoId: video.id,
            },
            relations: ['user'],
            order: {
                [orderColumn]: 'desc',
            },
        });
    }
}