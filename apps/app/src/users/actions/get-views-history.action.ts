import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { Repository } from 'typeorm';
import { Video } from '../../videos/models/video.model';
import { ViewHistory } from '../../videos/models/view-history.model';
import { FiltersDto } from '../dtos/filters.dto';
import { User } from '../models/user.model';
import { FindOptionsWhere } from 'typeorm';
import { SearchHelper } from '../helpers/search.helper';

type ViewsHistory = {
    [key: string]: Video[]
}

@Injectable()
export class GetViewsHistoryAction {
    public constructor(
        @InjectRepository(ViewHistory)
        private readonly history: Repository<ViewHistory>,
    ) {}

    public async run(user: User, filters?: FiltersDto): Promise<ViewsHistory> {
        const views = await this.getViewsWithVideos(user, filters);
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

    private getViewsWithVideos(user: User, filters?: FiltersDto): Promise<ViewHistory[]> {
        let videoFilters: FindOptionsWhere<Video>[];

        if (filters && filters.search) {
            videoFilters = SearchHelper.makeVideoSearchConditions(filters.search);
        }

        return this.history.find({
            where: {
                userId: user.id,
                video: videoFilters,
            },
            order: {
                viewedAt: 'desc',
            },
            relations: {
                video: {
                    user: true,
                },
            },
        });
    }
}