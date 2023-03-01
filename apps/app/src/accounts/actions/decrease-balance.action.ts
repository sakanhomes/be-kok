import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { __ } from '@app/core/helpers';
import { ModelLocker } from '@app/core/orm/model-locker';
import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { EntityManager } from 'typeorm';
import { Account } from '../models/account.model';

@Injectable()
export class DecreaseBalanceAction {
    private locker: ModelLocker;

    public constructor(manager: EntityManager) {
        this.locker = new ModelLocker(manager);
    }

    public async run(account: Account, amount: Decimal.Value): Promise<Account> {
        const updatedAccount = await this.locker.lock(account, async (manager, account) => {
            if (account.balance.lessThan(amount)) {
                throw new UnprocessableException(__('errors.insufficient-account-balance'));
            }

            account.balance = account.balance.sub(amount);

            await manager.save(account);
        });

        Object.assign(account, updatedAccount);

        return account;
    }
}