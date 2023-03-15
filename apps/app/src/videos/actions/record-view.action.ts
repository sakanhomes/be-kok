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

    public async run(user: User, video: Video): Promise<Video> {
        const historyRecord = this.history.create({
            userId: user.id,
            videoId: video.id,
        });

        const updatedVideo = await ModelLocker.using(this.videos.manager).lock(video, async (manager, video) => {
            const historyRecordExits = await manager.createQueryBuilder(ViewHistory, 'history')
                .select('id')
                .where('history.videoId = :videoId', { videoId: video.id })
                .andWhere('history.userId = :userId', { userId: user.id })
                .getExists();

            await manager.save(historyRecord);

            if (historyRecordExits) {
                return;
            }

            video.viewsAmount++;

            await manager.save(video);
        });

        return updatedVideo;
    }
}