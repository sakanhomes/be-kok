import { LockService } from '@app/core/support/locker/lock.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionAction } from '../../accounts/actions/create-transaction.action';
import { GetUserAccountAction } from '../../accounts/actions/get-user-account.action';
import { AccountTransaction } from '../../accounts/models/account-transaction.model';
import { AccountTransactionBuilder } from '../../accounts/models/account-transaction.builder';
import { Account } from '../../accounts/models/account.model';
import { User } from '../../users/models/user.model';
import { RewardsLimitExceededException } from '../exceptions/rewards-limit-exceeded.exception';
import { Video } from '../models/video.model';
import { TransactionSubtype } from '../../accounts/enums/transaction-subtype.enum';
import { TransactionType } from '../../accounts/enums/transaction-type.enum';
import { VideosConfig } from 'config/videos';
import { Config } from '@app/core/config/decorators/config.decorator';

@Injectable()
export class EnrollLikeRewardAction {
    public constructor(
        private readonly locker: LockService,
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private readonly accountGetter: GetUserAccountAction,
        @InjectRepository(AccountTransaction)
        private readonly transactions: Repository<AccountTransaction>,
        private readonly transactionCreator: CreateTransactionAction,
        @Config('videos')
        private readonly config: VideosConfig,
    ) {}

    public async runSilent(video: Video): Promise<AccountTransaction | null> {
        try {
            return await this.run(video);
        } catch (error) {
            if (!(error instanceof RewardsLimitExceededException)) {
                throw error;
            }

            return null;
        }
    }

    public async run(video: Video): Promise<AccountTransaction> {
        if (this.config.rewards.like.enabled === false) {
            return;
        }

        const creator = await this.users.findOneBy({ id: video.userId });
        const account = await this.accountGetter.run(creator);

        const key = `videos.rewards-enrolling.like.${video.id}`;

        await this.locker.get(key);

        try {
            await this.ensureRewardsLimitIsNotExceeded(account, video);

            return await this.transactionCreator.run(this.buildTransaction(account, video));
        } finally {
            this.locker.release(key);
        }
    }

    private buildTransaction(account: Account, video: Video): AccountTransaction {
        return AccountTransactionBuilder.build()
            .reward(TransactionSubtype.LIKE)
            .amount(this.config.rewards.like.amount)
            .to(account)
            .attach(video)
            .get();
    }

    private async ensureRewardsLimitIsNotExceeded(account: Account, video: Video): Promise<void> {
        if (this.config.rewards.like.limit === null) {
            return;
        }

        const enrolledRewardsAmount = await this.transactions.countBy({
            accountId: account.id,
            type: TransactionType.REWARD,
            subtype: TransactionSubtype.LIKE,
            videoId: video.id,
        });

        if (enrolledRewardsAmount >= this.config.rewards.like.limit) {
            throw new RewardsLimitExceededException(video);
        }
    }
}
