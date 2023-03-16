import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../models/subscription.model';
import { User } from '../models/user.model';

@Injectable()
export class GetUserSubscriptionsAction {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
    ) {}

    public async run(user: User): Promise<User[]> {
        return await this.users.createQueryBuilder('user')
            .select('user')
            .innerJoin(Subscription, 'sub', 'user.id = sub.userId')
            .where('sub.subscriberId = :id', { id: user.id })
            .getMany();
    }
}