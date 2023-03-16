import { escapeLike } from '@app/core/helpers';
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { SubsFiltersDto } from '../dtos/subs-filters.dto';

export class SubsHelper {
    public static applyFilters<T = any>(query: SelectQueryBuilder<T>, filters: SubsFiltersDto): SelectQueryBuilder<T> {
        if (filters.search && filters.search.length) {
            const search = '%' + escapeLike(filters.search.toLowerCase()) + '%';

            query.andWhere(new Brackets(query => {
                query.orWhere('user.address like :search', { search })
                    .orWhere('lower(user.name) like :search', { search });
            }));
        }

        return query;
    }
}