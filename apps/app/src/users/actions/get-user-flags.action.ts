import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../models/subscription.model';
import { User } from '../models/user.model';

export type CreatorFlags = {
    isSubscribed: boolean,
}

export class GetUserFlagsAction {
    public constructor(
        @InjectRepository(Subscription)
        private readonly subscriptions: Repository<Subscription>,
    ) {}

    public async run(currentUser: User | null, user: User): Promise<CreatorFlags> {
        if (!currentUser) {
            return {
                isSubscribed: false,
            };
        }

        const isSubscribed = await this.subscriptions.exist({
            where: {
                userId: user.id,
                subscriberId: currentUser.id,
            },
        });

        return { isSubscribed };
    }
}