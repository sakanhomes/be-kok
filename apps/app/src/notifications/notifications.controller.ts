import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { JwtAuth } from '@app/core/auth/decorators/jwt-auth.decorator';
import { Controller, Get } from '@nestjs/common';
import { User } from '../users/models/user.model';
import { GetUserNotifications } from './actions/get-user-notifications.action';
import { MarkNotificationsAsReadAction } from './actions/mark-notifications-as-read.action';
import { NotificationResource } from './resources/notification.resource';

@Controller('/notifications')
@JwtAuth()
export class NotificationsController {
    public constructor(
        private readonly notificationsGetter: GetUserNotifications,
        private readonly reader: MarkNotificationsAsReadAction,
    ) {}

    @Get('/')
    public async list(@CurrentUser() user: User) {
        const notifications = await this.notificationsGetter.run(user);

        return NotificationResource.collection(notifications);
    }
}