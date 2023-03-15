import { LockService } from '@app/core/support/locker/lock.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { Account } from '../models/account.model';

@Injectable()
export class GetUserAccountAction {
    public constructor(
        private readonly locker: LockService,
        @InjectRepository(Account)
        private readonly accounts: Repository<Account>,
    ) {}

    public async run(user: User): Promise<Account> {
        const key = `accounts.creating.${user.id}`;

        await this.locker.get(key);

        try {
            let account = await this.accounts.findOneBy({
                userId: user.id,
            });

            if (account) {
                return account;
            }

            account = this.accounts.create({
                userId: user.id,
                balance: 0,
            });

            return await this.accounts.save(account);
        } finally {
            this.locker.release(key);
        }
    }
}