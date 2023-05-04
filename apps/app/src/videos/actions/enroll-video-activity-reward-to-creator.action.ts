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
import { RewardableActivity } from '../enums/rewardable-activity.enum';
import { RewardAlreadyEnrolledException } from '../exceptions/reward-already-enrolled.exception';

type SupportedRewarableActivity = Exclude<RewardableActivity, RewardableActivity.CREATION>;

@Injectable()
export class EnrollVideoActivityRewardToCreatorAction {
    private readonly transactionSubtypes: { [K in SupportedRewarableActivity]: TransactionSubtype } = {
        [RewardableActivity.VIEW]: TransactionSubtype.VIEW,
        [RewardableActivity.LIKE]: TransactionSubtype.LIKE,
        [RewardableActivity.COLLECTION]: TransactionSubtype.COLLECTION,
    };

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

    public async runSilent(
        user: User,
        video: Video,
        activity: SupportedRewarableActivity,
    ): Promise<AccountTransaction | null> {
        try {
            return await this.run(user, video, activity);
        } catch (error) {
            /* eslint-disable prettier/prettier */
            if (
                !(error instanceof RewardsLimitExceededException)
                && !(error instanceof RewardAlreadyEnrolledException)
            ) {
                throw error;
            }
            /* eslint-enable prettier/prettier */

            return null;
        }
    }

    public async run(user: User, video: Video, activity: SupportedRewarableActivity): Promise<AccountTransaction> {
        if (this.config.rewards[activity].enabled === false) {
            return;
        }

        const creator = await this.users.findOneBy({ id: video.userId });
        const account = await this.accountGetter.run(creator);

        const key = `videos.rewards-enrolling.${activity}.${video.id}`;

        await this.locker.get(key);

        try {
            await this.ensureRewardIsntEnrolled(account, user, video, activity);
            await this.ensureRewardsLimitIsNotExceeded(account, video, activity);

            return await this.transactionCreator.run(this.buildTransaction(account, video, activity, user));
        } finally {
            this.locker.release(key);
        }
    }

    private buildTransaction(
        account: Account,
        video: Video,
        activity: SupportedRewarableActivity,
        trigger: User,
    ): AccountTransaction {
        return AccountTransactionBuilder.build()
            .reward(this.transactionSubtypes[activity])
            .amount(this.config.rewards[activity].amount)
            .to(account)
            .attach(video)
            .triggeredBy(trigger)
            .get();
    }

    private async ensureRewardIsntEnrolled(
        account: Account,
        trigger: User,
        video: Video,
        activity: SupportedRewarableActivity,
    ): Promise<void> {
        const rewardEnrolled = await this.transactions.exist({
            where: {
                accountId: account.id,
                type: TransactionType.REWARD,
                subtype: this.transactionSubtypes[activity],
                videoId: video.id,
                triggerId: trigger.id,
            },
        });

        if (rewardEnrolled) {
            throw new RewardAlreadyEnrolledException(account, video);
        }
    }

    private async ensureRewardsLimitIsNotExceeded(
        account: Account,
        video: Video,
        activity: SupportedRewarableActivity,
    ): Promise<void> {
        if (this.config.rewards[activity].limit === null) {
            return;
        }

        const enrolledRewardsAmount = await this.transactions.countBy({
            accountId: account.id,
            type: TransactionType.REWARD,
            subtype: this.transactionSubtypes[activity],
            videoId: video.id,
        });

        if (enrolledRewardsAmount >= this.config.rewards[activity].limit) {
            throw new RewardsLimitExceededException(video);
        }
    }
}
