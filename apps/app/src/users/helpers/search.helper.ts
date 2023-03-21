import { escapeLike } from '@app/core/helpers';
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { FiltersDto } from '../dtos/filters.dto';

export class SearchHelper {
    public static applyUserSearchFilters<T = any>(
        query: SelectQueryBuilder<T>,
        filters: FiltersDto,
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
}