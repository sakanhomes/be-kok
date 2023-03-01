import { sleep } from '@app/core/helpers';
import { ModelLocker } from '@app/core/orm/model-locker';
import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { DataSource, EntityManager } from 'typeorm';
import { Account } from '../models/account.model';

@Injectable()
export class IncreaseBalanceAction {
    private locker: ModelLocker;

    public constructor(manager: EntityManager) {
        this.locker = new ModelLocker(manager);
    }

    public async run(account: Account, amount: Decimal.Value): Promise<Account> {
        const updatedAccount = await this.locker.lock(account, async (manager, account) => {
            account.balance = account.balance.add(amount);

            await manager.save(account);
        });

        Object.assign(account, updatedAccount);

        return account;
    }
}