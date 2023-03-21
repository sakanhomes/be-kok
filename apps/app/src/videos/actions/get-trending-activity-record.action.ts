import { unixtime } from '@app/core/helpers';
import { LockService } from '@app/core/support/locker/lock.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { startOfDay } from 'date-fns';
import Decimal from 'decimal.js';
import { Repository } from 'typeorm';
import { VideoTrendingActivity } from '../models/video-trending-activity.model';
import { Video } from '../models/video.model';

@Injectable()
export class GetTrendingActivityRecordAction {
    public constructor(
        private readonly locker: LockService,
        @InjectRepository(VideoTrendingActivity)
        private readonly activities: Repository<VideoTrendingActivity>,
    ) {}

    public async run(video: Video, day: Date): Promise<VideoTrendingActivity> {
        day = startOfDay(day);

        const attributes = {
            videoId: video.id,
            day,
        };
        const key = `videos.trending.creating.${video.id}.${unixtime(day)}`;

        await this.locker.get(key);

        try {
            let record = await this.activities.findOneBy(attributes);

            if (record) {
                return record;
            }

            record = this.activities.create(attributes);
            record.actionsAmount = new Decimal(0);
            record = await this.activities.save(record);

            return record;
        } finally {
            this.locker.release(key);
        }
    }
}