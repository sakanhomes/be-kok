import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { startOfToday, subDays } from 'date-fns';
import { Repository } from 'typeorm';
import { VIDEOS_CONFIG } from '../constants';
import { VideoTrendingActivity } from '../models/video-trending-activity.model';

@Injectable()
export class ClearTrendingVideosActivityJob {
    public constructor(
        @InjectRepository(VideoTrendingActivity)
        private readonly trends: Repository<VideoTrendingActivity>,
        @Inject(VIDEOS_CONFIG)
        private readonly config: Record<string, any>,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    public async run(): Promise<void> {
        const deadline = subDays(startOfToday(), this.config.trends.lastDaysRange);

        await this.trends.createQueryBuilder()
            .delete()
            .where('day < :deadline', { deadline })
            .execute();
    }
}
