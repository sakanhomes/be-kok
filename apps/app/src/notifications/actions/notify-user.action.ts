import { randomString } from '@app/core/helpers';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUserSettingAction } from '../../user-settings/actions/get-user-setting.action';
import { User } from '../../users/models/user.model';
import { BaseNotification } from '../base.notification';
import { CanBeDisabled } from '../interfaces/can-be-disabled.interface';
import { Notification } from '../models/notification.model';

export class NotifyUserAction {
    public constructor(
        @InjectRepository(Notification)
        private readonly notifications: Repository<Notification>,
        private readonly settingGetter: GetUserSettingAction,
    ) {}

    public async run(user: User, notification: BaseNotification): Promise<void> {
        const shouldBeNotified = await this.shouldBeNotified(user, notification);

        if (!shouldBeNotified) {
            return;
        }

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

    private async shouldBeNotified(user: User, notification: BaseNotification | CanBeDisabled): Promise<boolean> {
        const key = (notification as CanBeDisabled).disableNotificationConfigKey;

        if (!key) {
            return true;
        }

        const setting = await this.settingGetter.run(user, key);

        return Boolean(setting);
    }
}