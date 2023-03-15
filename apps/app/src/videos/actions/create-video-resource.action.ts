import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { VideoLike } from '../models/video-like.model';
import { Video } from '../models/video.model';
import { VideoResource } from '../resources/video.resource';

@Injectable()
export class CreateVideoResourceAction {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        @InjectRepository(VideoLike)
        private readonly likes: Repository<VideoLike>,
    ) {}

    public async run(user: User, video: Video): Promise<VideoResource> {
        const creator = await this.users.findOneBy({
            id: video.userId,
        });
        const flags = {
            isLiked: await this.likes.exist({
                where: {
                    videoId: video.id,
                    userId: user.id,
                },
            }),
        };

        return new VideoResource(video, { creator, flags });
    }
}