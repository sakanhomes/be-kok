import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { __ } from '@app/core/helpers';
import { ModelLocker } from '@app/core/orm/model-locker';
import { LockService } from '@app/core/support/locker/lock.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../models/subscription.model';
import { User } from '../models/user.model';

@Injectable()
export class UnsubscribeFromUserAction {
    public constructor(
        private readonly locker: LockService,
        @InjectRepository(User)
        private readonly users: Repository<User>,
        @InjectRepository(Subscription)
        private readonly subscriptions: Repository<Subscription>,
    ) {}

    public async run(creator: User, subscriber: User): Promise<User> {
        await this.ensureUserIsSubscribed(creator, subscriber);

        const key = `users.subscriptions.remove.${creator.id}.${subscriber.id}`;

        await this.locker.get(key);

        try {
            return await ModelLocker.using(this.users.manager).lock(creator, async (manager, creator) => {
                await this.ensureUserIsSubscribed(creator, subscriber);

                const subscription = await this.subscriptions.findOneBy({
                    userId: creator.id,
                    subscriberId: subscriber.id,
                });
                creator.followersAmount = Math.max(creator.followersAmount - 1, 0);

                await manager.remove(subscription);
                await manager.save(creator);
            });
        } finally {
            this.locker.release(key);
        }
    }

    private async ensureUserIsSubscribed(creator: User, subscriber: User): Promise<void> {
        const subscribed = await this.subscriptions.exist({
            where: {
                userId: creator.id,
                subscriberId: subscriber.id,
            },
        });

        if (!subscribed) {
            throw new UnprocessableException(__('errors.user-isnt-subscribed'));
        }
    }
}