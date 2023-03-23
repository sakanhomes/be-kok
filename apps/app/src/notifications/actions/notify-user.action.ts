import { randomString } from '@app/core/helpers';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { BaseNotification } from '../base.notification';
import { Notification } from '../models/notification.model';

export class NotifyUserAction {
    public constructor(
        @InjectRepository(Notification)
        private readonly notifications: Repository<Notification>,
    ) {}

    public async run(user: User, notification: BaseNotification): Promise<void> {
        const model = this.notifications.create({
            publicId: randomString(32),
            userId: user.id,
            type: (notification.constructor as any).type,
            data: {
                data: notification.getData(user),
                params: notification.getParams(user),
            },
        });

        await this.notifications.save(model);
    }
}