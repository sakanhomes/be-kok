import { keyBy } from '@app/core/helpers';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { subDays } from 'date-fns';
import { EntityManager, In, Repository } from 'typeorm';
import { TransactionType } from '../../accounts/enums/transaction-type.enum';
import { AccountTransaction } from '../../accounts/models/account-transaction.model';
import { Account } from '../../accounts/models/account.model';
import { User } from '../../users/models/user.model';

type Leaderboard = {
    month: User[],
    year: User[],
}

@Injectable()
export class GetLeaderboardAction {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private readonly manager: EntityManager,
    ) {}

    public async run(): Promise<Leaderboard> {
        return {
            month: await this.getLeadersForLastDays(30),
            year: await this.getLeadersForLastDays(365),
        };
    }

    private async getLeadersForLastDays(days: number, limit = 6): Promise<User[]> {
        const ids = await this.getLeaderIds(days, limit);
        let users: User[] | Record<string, User> = await this.users.findBy({
            id: In(ids),
        });
        users = keyBy(users, 'id');

        return ids.map(id => users[id]);
    }

    private async getLeaderIds(days: number, limit: number): Promise<string[]> {
        const records = await this.manager.createQueryBuilder(User, 'user')
            .select([])
            .addSelect('user.id', 'id')
            .addSelect('sum(transaction.amount)', 'total')
            .innerJoin(Account, 'account', 'user.id = account.userId')
            .innerJoin(AccountTransaction, 'transaction', 'transaction.accountId = account.id')
            .where('transaction.type = :type', { type: TransactionType.REWARD })
            .andWhere('transaction.createdAt >= :deadline', { deadline: subDays(Date.now(), days) })
            .groupBy('user.id')
            .orderBy('total', 'DESC')
            .limit(limit)
            .getRawMany();

        return records.map(record => record.id);
    }
}