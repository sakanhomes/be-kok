import { unixtime } from '@app/core/helpers';
import { LockService } from '@app/core/support/locker/lock.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { startOfDay } from 'date-fns';
import Decimal from 'decimal.js';
import { Repository } from 'typeorm';
import { VideoTrandingActivity } from '../models/video-tranding-activity.model';
import { Video } from '../models/video.model';

@Injectable()
export class GetTrandingActivityRecordAction {
    public constructor(
        private readonly locker: LockService,
        @InjectRepository(VideoTrandingActivity)
        private readonly activities: Repository<VideoTrandingActivity>,
    ) {}

    public async run(video: Video, day: Date): Promise<VideoTrandingActivity> {
        day = startOfDay(day);

        const attributes = {
            videoId: video.id,
            day,
        };
        const key = `video.tranding.creating.${video.id}.${unixtime(day)}`;

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