import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoLike } from '../../videos/models/video-like.model';
import { Video } from '../../videos/models/video.model';
import { User } from '../models/user.model';

@Injectable()
export class GetFavouriteVideosAction {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
    ) {}

    public async run(user: User): Promise<Video[]> {
        return await this.videos.createQueryBuilder('video')
            .innerJoin(VideoLike, 'like', 'like.videoId = video.id')
            .where('video.userId = :id', { id: user.id })
            .orderBy('like.likedAt', 'DESC')
            .getMany();
    }
}