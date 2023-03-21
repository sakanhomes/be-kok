import { keyBy } from '@app/core/helpers';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { startOfToday, subDays } from 'date-fns';
import { In, Repository } from 'typeorm';
import { VideoTrendingActivity } from '../models/video-trending-activity.model';
import { Video } from '../models/video.model';

@Injectable()
export class GetTrendingVideosAction {
    private readonly DAYS_LIMIT = 4;

    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
        @InjectRepository(VideoTrendingActivity)
        private readonly trends: Repository<VideoTrendingActivity>,
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
        const records = await this.trends.createQueryBuilder('trend')
            .select([])
            .addSelect('trend.videoId', 'videoId')
            .addSelect('sum(trend.actionsAmount)', 'total')
            .innerJoin(Video, 'video', 'trend.videoId = video.id')
            .where('video.isPublic = 1')
            .andWhere('trend.day >= :deadline', { deadline: subDays(startOfToday(), this.DAYS_LIMIT) })
            .groupBy('trend.videoId')
            .orderBy('total', 'DESC')
            .take(amount)
            .getRawMany();

        return records.map(record => record.videoId);
    }
}