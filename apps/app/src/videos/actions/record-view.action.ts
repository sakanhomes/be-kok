import { ModelLocker } from '@app/core/orm/model-locker';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { Video } from '../models/video.model';
import { ViewHistory } from '../models/view-history.model';

@Injectable()
export class RecordViewAction {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
        @InjectRepository(ViewHistory)
        private readonly history: Repository<ViewHistory>,
    ) {}

    public run(user: User | null, video: Video): Promise<Video> {
        if (user) {
            return this.recordUserView(user, video);
        } else {
            return this.recordAnonymousView(video);
        }
    }

    private async recordAnonymousView(video: Video): Promise<Video> {
        return await ModelLocker.using(this.videos.manager).lock(video, async (manager, video) => {
            video.viewsAmount++;

            await manager.save(video);
        });
    }

    private async recordUserView(user: User, video: Video): Promise<Video> {
        return await ModelLocker.using(this.videos.manager).lock(video, async (manager, video) => {
            const historyRecordExists = await manager.createQueryBuilder(ViewHistory, 'history')
                .select('id')
                .where('history.videoId = :videoId', { videoId: video.id })
                .andWhere('history.userId = :userId', { userId: user.id })
                .getExists();

            if (historyRecordExists) {
                return;
            }

            const historyRecord = this.history.create({
                userId: user.id,
                videoId: video.id,
            });

            video.viewsAmount++;

            await manager.save(historyRecord);
            await manager.save(video);
        });
    }
}