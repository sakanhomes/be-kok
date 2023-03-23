import { unixtime } from '@app/core/helpers';
import { Resource } from '@app/core/http/resources/resource';
import { Notification } from '../models/notification.model';
import { NotificationsModule } from '../notifications.module';

export class NotificationResource extends Resource {
    public static wrap = 'notification';

    public constructor(private readonly notification: Notification) {
        super();
    }

    public data(): Record<string, any> {
        const notificationClass = NotificationsModule.getNotificationOrFail(this.notification.type);
        const message = (notificationClass as any).toMessage(this.notification.data);

        return {
            id: this.notification.publicId,
            type: this.notification.type,
            message,
            params: this.notification.data.params ?? null,
            createdAt: unixtime(this.notification.createdAt),
            readAt: this.notification.readAt ? unixtime(this.notification.readAt) : null,
        };
    }
}