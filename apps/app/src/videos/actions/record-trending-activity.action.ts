import { ModelLocker } from '@app/core/orm/model-locker';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { VideoTrendingActivityHistory } from '../models/video-trending-activity-history.model';
import { VideoTrendingActivity } from '../models/video-trending-activity.model';
import { Video } from '../models/video.model';
import { GetTrendingActivityRecordAction } from './get-trending-activity-record.action';

@Injectable()
export class RecordTrendingActivityAction {
    public constructor(
        @InjectRepository(VideoTrendingActivity)
        private readonly activity: Repository<VideoTrendingActivity>,
        private readonly activityCreator: GetTrendingActivityRecordAction,
    ) {}

    public async run(user: User | null, video: Video): Promise<void> {
        const activity = await this.activityCreator.run(video, new Date);

        if (user) {
            await this.recordUserActivity(activity, user, video);
        } else {
            await this.recordAnonymousActivity(activity);
        }
    }

    private async recordAnonymousActivity(activity: VideoTrendingActivity): Promise<void> {
        await ModelLocker.using(this.activity.manager).lock(activity, async (manager, activity) => {
            activity.actionsAmount = activity.actionsAmount.add(1);

            await manager.save(activity);
        });
    }

    private async recordUserActivity(activity: VideoTrendingActivity, user: User, video: Video): Promise<void> {
        await ModelLocker.using(this.activity.manager).lock(activity, async (manager, activity) => {
            const historyRepository = manager.getRepository(VideoTrendingActivityHistory);

            const historyAttributes = {
                videoId: video.id,
                userId: user.id,
            };
            const exists = await historyRepository.exist({
                where: historyAttributes,
            });

            if (exists) {
                return;
            }

            const history = historyRepository.create(historyAttributes);
            activity.actionsAmount = activity.actionsAmount.add(1);

            await manager.save(history);
            await manager.save(activity);
        });
    }
}