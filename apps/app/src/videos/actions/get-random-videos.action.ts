import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../models/video.model';

@Injectable()
export class GetRandomVideosAction {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
    ) {}

    public async run(amount: number): Promise<Video[]> {
        return this.videos
            .createQueryBuilder('video')
            .select()
            .leftJoinAndSelect('video.user', 'user')
            .orderBy('RAND()')
            .limit(amount)
            .getMany();
    }
}