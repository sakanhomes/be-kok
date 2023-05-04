import Decimal from 'decimal.js';
import { TransactionSubtype } from '../enums/transaction-subtype.enum';
import { TransactionType } from '../enums/transaction-type.enum';
import { AccountTransaction } from './account-transaction.model';
import { Account } from './account.model';

export class AccountTransactionBuilder {
    private transaction: AccountTransaction;

    public constructor() {
        this.transaction = new AccountTransaction();
    }

    public static build(): AccountTransactionBuilder {
        return new AccountTransactionBuilder();
    }

    public get(): AccountTransaction {
        return this.transaction;
    }

    public to(account: Account): AccountTransactionBuilder {
        this.transaction.account = account;

        return this;
    }

    public reward(subtype: TransactionSubtype): AccountTransactionBuilder {
        this.transaction.type = TransactionType.REWARD;
        this.transaction.subtype = subtype;

        return this;
    }

    public amount(amount: Decimal.Value): AccountTransactionBuilder {
        this.transaction.amount = amount instanceof Decimal ? amount : new Decimal(amount);

        return this;
    }

    public attach(model: object): AccountTransactionBuilder {
        const property = model.constructor.name.toLowerCase();

        this.transaction[property] = model;

        return this;
    }

    public triggeredBy(trigger: { id: string }): this {
        this.transaction.triggerId = trigger.id;

        return this;
    }
}
