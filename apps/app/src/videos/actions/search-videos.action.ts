import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHelper } from '../../users/helpers/search.helper';
import { Video } from '../models/video.model';

@Injectable()
export class SearchVideosAction {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
    ) {}

    public run(search?: string, limit = 25): Promise<Video[]> {
        const query = this.videos.createQueryBuilder('video')
            .leftJoinAndSelect('video.user', 'user')
            .take(limit)
            .orderBy('video.createdAt', 'DESC');

        if (search) {
            SearchHelper.applyVideoSearchFilters(query, search);
        }

        return query.getMany();
    }
}