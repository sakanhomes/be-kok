import { keyBy } from '@app/core/helpers';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { startOfToday, subDays } from 'date-fns';
import { In, Repository } from 'typeorm';
import { VideoTrandingActivity } from '../models/video-tranding-activity.model';
import { Video } from '../models/video.model';

@Injectable()
export class GetTrandingVideosAction {
    private readonly DAYS_LIMIT = 4;

    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
        @InjectRepository(VideoTrandingActivity)
        private readonly trands: Repository<VideoTrandingActivity>,
    ) {}

    public async run(amount = 8): Promise<Video[]> {
        const ids = await this.getTrandingVideoIds(amount);
        const videos = await this.videos.find({
            where: {
                id: In(ids),
            },
            relations: ['user'],
        }).then(videos => keyBy(videos, 'id'));

        return ids.map(id => videos[id]);
    }

    private async getTrandingVideoIds(amount): Promise<string[]> {
        const records = await this.trands.createQueryBuilder('trand')
            .select([])
            .addSelect('trand.videoId', 'videoId')
            .addSelect('sum(trand.actionsAmount)', 'total')
            .innerJoin(Video, 'video', 'trand.videoId = video.id')
            .where('video.isPublic = 1')
            .andWhere('trand.day >= :deadline', { deadline: subDays(startOfToday(), this.DAYS_LIMIT) })
            .groupBy('trand.videoId')
            .orderBy('total', 'DESC')
            .take(amount)
            .getRawMany();

        return records.map(record => record.videoId);
    }
}