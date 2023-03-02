import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateVideoDto } from '../dtos/update-video.dto';
import { Video } from '../models/video.model';

@Injectable()
export class UpdateVideoAction {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
    ) {}

    public async run(video: Video, data: UpdateVideoDto): Promise<Video> {
        Object.assign(video, data);

        await this.videos.save(video);

        return video;
    }
}