import { Class } from '@app/core/types/class.type';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSettingsModule } from '../user-settings/user-settings.module';
import { GetUserNotifications } from './actions/get-user-notifications.action';
import { MarkNotificationsAsReadAction } from './actions/mark-notifications-as-read.action';
import { NotifyUserAction } from './actions/notify-user.action';
import { BaseNotification } from './base.notification';
import { ClearNotificationsJob } from './jobs/clear-notifications.job';
import { Notification } from './models/notification.model';
import { NotificationsController } from './notifications.controller';
import { MarkAllNotificationsAsReadAction } from './actions/mark-all-notifications-as-read.action';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification]),
        UserSettingsModule,
    ],
    providers: [
        GetUserNotifications,
        MarkNotificationsAsReadAction,
        MarkAllNotificationsAsReadAction,
        NotifyUserAction,
        ClearNotificationsJob,
    ],
    exports: [
        NotifyUserAction,
    ],
    controllers: [NotificationsController],
})
export class NotificationsModule {
    private static notifications: Map<string, Class<BaseNotification>> = new Map();

    public static registerNotifications(notifications: Class<BaseNotification>[]): void {
        for (const notification of notifications) {
            const type: string = (notification as any).type;

            if (!type) {
                throw new Error(`Type of notification [${notification}] is not specified`);
            } else if (this.notifications.has(type)) {
                throw new Error(`Notification type [${type}] is already registered`);
            }

            this.notifications.set(type, notification);
        }
    }

    public static getNotification(type: string): Class<BaseNotification> | null {
        return this.notifications.get(type) ?? null;
    }

    public static getNotificationOrFail(type: string): Class<BaseNotification> {
        const notification = this.getNotification(type);

        if (notification) {
            return notification;
        }

        throw new Error(`Notification class for type [${type}] is not registered`);
    }
}
