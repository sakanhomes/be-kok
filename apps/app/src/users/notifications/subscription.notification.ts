import { BaseNotification } from '../../notifications/base.notification';
import { CanBeDisabled } from '../../notifications/interfaces/can-be-disabled.interface';
import { User } from '../models/user.model';

export class SubscriptionNotification extends BaseNotification implements CanBeDisabled {
    public static readonly type = 'user.subscription';
    public disableNotificationConfigKey = 'notifications.events.subscription';

    public constructor(private readonly subscriber: User) {
        super();
    }

    public getData(): Record<string, any> {
        return {
            subscriberName: this.subscriber.name ?? this.subscriber.address,
        };
    }

    public getParams(): Record<string, any> {
        return {
            user: this.makeUserParams(this.subscriber),
        };
    }
}