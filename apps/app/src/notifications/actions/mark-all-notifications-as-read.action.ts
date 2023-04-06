import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from '../models/notification.model';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';

export class MarkAllNotificationsAsReadAction {
    public constructor(
        @InjectRepository(Notification)
        private readonly notifications: Repository<Notification>,
    ) {}

    public async run(user: User): Promise<void> {
        await this.notifications.createQueryBuilder()
            .update()
            .set({
                readAt: new Date,
            }).where({ userId: user.id })
            .execute();
    }
}
