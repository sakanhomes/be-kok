import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { VideoLike } from '../../videos/models/video-like.model';
import { Video } from '../../videos/models/video.model';
import { FiltersDto } from '../dtos/filters.dto';
import { User } from '../models/user.model';
import { escapeLike } from '@app/core/helpers';

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
            query.andWhere(new Brackets(query => {
                const search = '%' + escapeLike(filters.search.toLowerCase()) + '%';

                query.where('lower(video.title) like :search', { search })
                    .orWhere('lower(video.description) like :search', { search });
            }));
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