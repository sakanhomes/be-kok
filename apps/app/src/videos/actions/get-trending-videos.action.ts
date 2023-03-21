import { keyBy } from '@app/core/helpers';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { startOfToday, subDays } from 'date-fns';
import { In, Repository } from 'typeorm';
import { VIDEOS_CONFIG } from '../constants';
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

    public async run(amount = 8): Promise<Video[]> {
        const ids = await this.getTrendingVideoIds(amount);
        const videos = await this.videos.find({
            where: {
                id: In(ids),
            },
            relations: ['user'],
        }).then(videos => keyBy(videos, 'id'));

        return ids.map(id => videos[id]);
    }

    private async getTrendingVideoIds(amount): Promise<string[]> {
        const deadline = subDays(startOfToday(), this.config.trends.lastDaysRange);

        const records = await this.trends.createQueryBuilder('trend')
            .select([])
            .addSelect('trend.videoId', 'videoId')
            .addSelect('sum(trend.actionsAmount)', 'total')
            .innerJoin(Video, 'video', 'trend.videoId = video.id')
            .where('video.isPublic = 1')
            .andWhere('trend.day >= :deadline', { deadline })
            .groupBy('trend.videoId')
            .orderBy('total', 'DESC')
            .take(amount)
            .getRawMany();

        return records.map(record => record.videoId);
    }
}