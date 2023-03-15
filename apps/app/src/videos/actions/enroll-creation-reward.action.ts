import { LockService } from '@app/core/support/locker/lock.service';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionAction } from '../../accounts/actions/create-transaction.action';
import { GetUserAccountAction } from '../../accounts/actions/get-user-account.action';
import { AccountTransaction } from '../../accounts/models/account-transaction.model';
import { AccountTransactionBuilder } from '../../accounts/models/account-transaction.builder';
import { Account } from '../../accounts/models/account.model';
import { User } from '../../users/models/user.model';
import { VIDEOS_CONFIG } from '../constants';
import { RewardsLimitExceededException } from '../exceptions/rewards-limit-exceeded.exception';
import { Video } from '../models/video.model';
import { TransactionSubtype } from '../../accounts/enums/transaction-subtype.enum';
import { TransactionType } from '../../accounts/enums/transaction-type.enum';

@Injectable()
export class EnrollCreationRewardAction {
    public constructor(
        private readonly locker: LockService,
        private readonly accountGetter: GetUserAccountAction,
        @InjectRepository(AccountTransaction)
        private readonly transactions: Repository<AccountTransaction>,
        private readonly transactionCreator: CreateTransactionAction,
        @Inject(VIDEOS_CONFIG)
        private readonly config: Record<string, any>,
    ) {}

    public async run(user: User, video: Video): Promise<AccountTransaction> {
        const account = await this.accountGetter.run(user);
        const key = `videos.rewards-enrolling.creation.${user.id}`;

        await this.locker.get(key);

        try {
            await this.ensureRewardsLimitIsNotExceeded(account);

            return await this.transactionCreator.run(
                this.buildTransaction(account, video),
            );
        } finally {
            this.locker.release(key);
        }
    }

    private buildTransaction(account: Account, video: Video): AccountTransaction {
        return AccountTransactionBuilder.build()
            .reward(TransactionSubtype.UPLOAD)
            .amount(this.config.rewards.creation.amount)
            .to(account)
            .attach(video)
            .get();
    }

    private async ensureRewardsLimitIsNotExceeded(account: Account): Promise<void> {
        const enrolledRewardsAmount = await this.transactions.countBy({
            type: TransactionType.REWARD,
            subtype: TransactionSubtype.UPLOAD,
            accountId: account.id,
        });

        if (enrolledRewardsAmount >= this.config.rewards.creation.limit) {
            throw new RewardsLimitExceededException;
        }
    }
}