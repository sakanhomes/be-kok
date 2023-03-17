import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { Repository } from 'typeorm';
import { Video } from '../../videos/models/video.model';
import { ViewHistory } from '../../videos/models/view-history.model';
import { User } from '../models/user.model';

type ViewsHistory = {
    [key: string]: Video[]
}

@Injectable()
export class GetViewsHistoryAction {
    public constructor(
        @InjectRepository(ViewHistory)
        private readonly history: Repository<ViewHistory>,
    ) {}

    public async run(user: User): Promise<ViewsHistory> {
        const views = await this.getViewsWithVideos(user);
        const groups = {};

        for (const view of views) {
            const key = format(view.viewedAt, 'yyyy-MM-dd');

            if (!groups[key]) {
                groups[key] = [];
            }

            groups[key].push(view.video);
        }

        return groups;
    }

    private getViewsWithVideos(user: User): Promise<ViewHistory[]> {
        return this.history.find({
            where: {
                userId: user.id,
            },
            order: {
                viewedAt: 'desc',
            },
            relations: ['video'],
        });
    }
}