import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../models/user.model';
import { SearchHelper } from '@app/common/helpers/search.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { FiltersDto } from '../dtos/filters.dto';

@Injectable()
export class SearchUsersAction {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
    ) {}

    public run(filters: FiltersDto): Promise<User[]> {
        const query = this.users.createQueryBuilder('user')
            .take(filters.limit ?? 10)
            .orderBy('createdAt', 'DESC');

        if (filters.search && filters.search.length) {
            SearchHelper.applyUserSearchFilters(query, filters);
        }

        return query.getMany();
    }
}