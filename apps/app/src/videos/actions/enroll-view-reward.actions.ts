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
import { ViewRewardAlreadyEnrolledException } from '../exceptions/view-reward-already-enrolled.exception';
import { Video } from '../models/video.model';
import { TransactionSubtype } from '../../accounts/enums/transaction-subtype.enum';
import { TransactionType } from '../../accounts/enums/transaction-type.enum';
import { OwnershipVerifier } from '@app/core/orm/ownership-verifier';
import { RewardNotAllowedException } from '../exceptions/reward-not-allowed.exception';

@Injectable()
export class EnrollViewRewardAction {
    public constructor(
        private readonly locker: LockService,
        private readonly accountGetter: GetUserAccountAction,
        @InjectRepository(AccountTransaction)
        private readonly transactions: Repository<AccountTransaction>,
        private readonly transactionCreator: CreateTransactionAction,
        @Inject(VIDEOS_CONFIG)
        private readonly config: Record<string, any>,
    ) {}

    public async runSilent(user: User, video: Video): Promise<AccountTransaction | null> {
        try {
            return await this.run(user, video);
        } catch (error) {
            if (
                !(error instanceof ViewRewardAlreadyEnrolledException)
                && !(error instanceof RewardsLimitExceededException)
                && !(error instanceof RewardNotAllowedException)
            ) {
                throw error;
            }

            return null;
        }
    }

    public async run(user: User, video: Video): Promise<AccountTransaction> {
        this.ensureUserCanReceiveRewardForViewingVideo(user, video);

        const account = await this.accountGetter.run(user);

        await this.ensureAccountHaventGotRewardForVideo(account, video);

        const key = `videos.rewards-enrolling.view.${video.id}`;

        await this.locker.get(key);

        try {
            await this.ensureRewardsLimitIsNotExceeded(video);

            return await this.transactionCreator.run(
                this.buildTransaction(account, video),
            );
        } finally {
            this.locker.release(key);
        }
    }

    private buildTransaction(account: Account, video: Video): AccountTransaction {
        return AccountTransactionBuilder.build()
            .reward(TransactionSubtype.VIEW)
            .amount(this.config.rewards.view.amount)
            .to(account)
            .attach(video)
            .get();
    }

    private async ensureRewardsLimitIsNotExceeded(video: Video): Promise<void> {
        const enrolledRewardsAmount = await this.transactions.countBy({
            type: TransactionType.REWARD,
            subtype: TransactionSubtype.VIEW,
            videoId: video.id,
        });

        if (enrolledRewardsAmount >= this.config.rewards.view.limit) {
            throw new RewardsLimitExceededException(video);
        }
    }

    private async ensureAccountHaventGotRewardForVideo(account: Account, video: Video): Promise<void> {
        const rewardTransactionExists = await this.transactions.exist({
            where: {
                type: TransactionType.REWARD,
                subtype: TransactionSubtype.VIEW,
                accountId: account.id,
                videoId: video.id,
            },
        });

        if (rewardTransactionExists) {
            throw new ViewRewardAlreadyEnrolledException(account, video);
        }
    }

    private ensureUserCanReceiveRewardForViewingVideo(user: User, video: Video): void {
        if (!OwnershipVerifier.verify(user, video)) {
            throw new RewardNotAllowedException();
        }
    }
}