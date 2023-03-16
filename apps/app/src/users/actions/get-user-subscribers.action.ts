import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubsFiltersDto } from '../dtos/subs-filters.dto';
import { SubsHelper } from '../helpers/subs.helper';
import { Subscription } from '../models/subscription.model';
import { User } from '../models/user.model';

@Injectable()
export class GetUserSubscribersAction {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
    ) {}

    public async run(user: User, filters?: SubsFiltersDto): Promise<User[]> {
        const query = this.users.createQueryBuilder('user')
            .select('user')
            .innerJoin(Subscription, 'sub', 'user.id = sub.subscriberId')
            .where('sub.userId = :id', { id: user.id });

        if (filters) {
            SubsHelper.applyFilters(query, filters);
        }

        return await query.getMany();
    }
}