import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { __ } from '@app/core/helpers';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TransactionSubtypesMap } from '../enums/transaction-subtypes.map';
import { AccountTransaction } from '../models/account-transaction.model';
import { IncreaseBalanceAction } from './increase-balance.action';

@Injectable()
export class CreateTransactionAction {
    public constructor(private readonly manager: EntityManager) {}

    public async run(transaction: AccountTransaction): Promise<AccountTransaction> {
        this.validateTransaction(transaction);

        return this.manager.transaction(async (manager: EntityManager) => {
            const increaser = new IncreaseBalanceAction(manager);

            await increaser.run(transaction.account, transaction.amount);
            await manager.save(transaction);

            return transaction;
        });
    }

    private validateTransaction(transaction: AccountTransaction): void {
        const subtypes = TransactionSubtypesMap.get(transaction.type);

        if (!subtypes.includes(transaction.subtype)) {
            throw new UnprocessableException(__('errors.invalid-transaction-subtype'));
        }
    }
}