import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../videos/models/video.model';
import { Comment } from '../models/comment.model';

@Injectable()
export class GetVideoCommentsAction {
    public constructor(
        @InjectRepository(Comment)
        private readonly comments: Repository<Comment>,
    ) {}

    // TODO Add sorting (latest, most liked)
    public run(video: Video): Promise<Comment[]> {
        return this.comments.find({
            where: {
                videoId: video.id,
            },
            relations: ['user'],
        });
    }
}