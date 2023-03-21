import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { VideoLike } from '../../videos/models/video-like.model';
import { Video } from '../../videos/models/video.model';
import { FiltersDto } from '../dtos/filters.dto';
import { User } from '../models/user.model';
import { SearchHelper } from '@app/common/helpers/search.helper';

@Injectable()
export class GetFavouriteVideosAction {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
    ) {}

    public async run(user: User, filters?: FiltersDto): Promise<Video[]> {
        let query = this.getUserFavouriteVideosQuery(user);

        if (filters) {
            query = this.applyFilters(query, filters);
        }

        return await query.getMany();
    }

    private applyFilters(query: SelectQueryBuilder<Video>, filters: FiltersDto): SelectQueryBuilder<Video> {
        if (filters.search) {
            SearchHelper.applyVideoSearchFilters(query, filters.search);
        }

        return query;
    }

    private getUserFavouriteVideosQuery(user: User): SelectQueryBuilder<Video> {
        return this.videos.createQueryBuilder('video')
            .innerJoin(VideoLike, 'like', 'like.videoId = video.id')
            .where('like.userId = :id', { id: user.id })
            .orderBy('like.likedAt', 'DESC');
    }
}