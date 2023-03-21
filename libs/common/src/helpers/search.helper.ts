import { escapeLike } from '@app/core/helpers';
import { Video } from 'apps/app/src/videos/models/video.model';
import { Brackets, FindOptionsWhere, Raw, SelectQueryBuilder } from 'typeorm';
import { FiltersDto as UserFilters } from 'apps/app/src/users/dtos/filters.dto';

export class SearchHelper {
    public static applyUserSearchFilters<T = any>(
        query: SelectQueryBuilder<T>,
        filters: UserFilters,
        alias = 'user',
    ): SelectQueryBuilder<T> {
        if (filters.search && filters.search.length) {
            const search = '%' + escapeLike(filters.search.toLowerCase()) + '%';

            query.andWhere(new Brackets(query => {
                query.orWhere(`${alias}.address like :search`, { search })
                    .orWhere(`lower(${alias}.name) like :search`, { search });
            }));
        }

        return query;
    }

    public static applyVideoSearchFilters<T = any>(
        query: SelectQueryBuilder<T>,
        search: string,
        alias = 'video',
    ): SelectQueryBuilder<T> {
        search = '%' + escapeLike(search.toLowerCase()) + '%';

        query.andWhere(new Brackets(query => {
            query.where(`lower(${alias}.title) like :search`, { search })
                .orWhere(`lower(${alias}.description) like :search`, { search });
        }));

        return query;
    }

    public static makeVideoSearchConditions(search: string): FindOptionsWhere<Video>[] {
        search = escapeLike(search.toLowerCase());

        return [
            { title: Raw(alias => `${alias} like '%${search}%'`) },
            { description: Raw(alias => `${alias} like '%${search}%'`) },
        ];
    }
}