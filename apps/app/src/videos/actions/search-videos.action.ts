import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHelper } from '@app/common/helpers/search.helper';
import { FiltersDto } from '../dtos/filters.dto';
import { Video } from '../models/video.model';

@Injectable()
export class SearchVideosAction {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
    ) {}

    public run(filters: FiltersDto): Promise<Video[]> {
        const query = this.videos.createQueryBuilder('video')
            .leftJoinAndSelect('video.user', 'user')
            .take(filters.limit ?? 10)
            .orderBy('video.createdAt', 'DESC');

        if (filters.search && filters.search.length) {
            SearchHelper.applyVideoSearchFilters(query, filters.search);
        }

        return query.getMany();
    }
}