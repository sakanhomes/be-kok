import { keyBy } from '@app/core/helpers';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { startOfToday, subDays } from 'date-fns';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { VIDEOS_CONFIG } from '../constants';
import { CommonVideosFiltersDto } from '../dtos/common-videos-filters.dto';
import { Category } from '../enums/category.enum';
import { VideoTrendingActivity } from '../models/video-trending-activity.model';
import { Video } from '../models/video.model';

@Injectable()
export class GetTrendingVideosAction {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
        @InjectRepository(VideoTrendingActivity)
        private readonly trends: Repository<VideoTrendingActivity>,
        @Inject(VIDEOS_CONFIG)
        private readonly config: Record<string, any>,
    ) {}

    public async run(amount: number, filters?: CommonVideosFiltersDto): Promise<Video[]> {
        const ids = await this.getTrendingVideoIds(amount, filters);
        const videos = await this.videos.find({
            where: {
                id: In(ids),
            },
            relations: ['user'],
        }).then(videos => keyBy(videos, 'id'));

        return ids.map(id => videos[id]);
    }

    private async getTrendingVideoIds(amount: number, filters?: CommonVideosFiltersDto): Promise<string[]> {
        const query = this.getTrendingVideoIdsQuery();
        const deadline = subDays(startOfToday(), this.config.trends.lastDaysRange);

        query.andWhere('trend.day >= :deadline', { deadline }).take(amount);

        if (filters) {
            this.applyFilters(query, filters);
        }

        const records = await query.getRawMany();

        return records.map(record => record.videoId);
    }

    private applyFilters(query: SelectQueryBuilder<VideoTrendingActivity>, filters: CommonVideosFiltersDto): void {
        if (filters.category) {
            query.andWhere('video.categoryId = :category', { category: Category[filters.category] });
        }
    }

    private getTrendingVideoIdsQuery(): SelectQueryBuilder<VideoTrendingActivity> {
        return this.trends.createQueryBuilder('trend')
            .select([])
            .addSelect('trend.videoId', 'videoId')
            .addSelect('sum(trend.actionsAmount)', 'total')
            .innerJoin(Video, 'video', 'trend.videoId = video.id')
            .where('video.isPublic = 1')
            .groupBy('trend.videoId')
            .orderBy('total', 'DESC');
    }
}