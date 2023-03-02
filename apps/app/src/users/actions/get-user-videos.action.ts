import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../videos/models/video.model';
import { User } from '../models/user.model';

@Injectable()
export class GetUserVideos {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
    ) {}

    public run(user: User): Promise<Video[]> {
        return this.videos.find({
            where: {
                userId: user.id,
                isPublic: true,
            },
            order: {
                createdAt: 'desc',
            },
        });
    }
}