import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../models/user.model';
import { SearchHelper } from '../helpers/search.helper';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SearchUsersAction {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
    ) {}

    public run(search?: string, limit = 2): Promise<User[]> {
        const query = this.users.createQueryBuilder('user')
            .take(limit)
            .orderBy('createdAt', 'DESC');

        if (search) {
            SearchHelper.applyUserSearchFilters(query, { search });
        }

        return query.getMany();
    }
}