import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { JwtAuth } from '@app/core/auth/decorators/jwt-auth.decorator';
import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';
import { User } from '../users/models/user.model';
import { GetUserNotifications } from './actions/get-user-notifications.action';
import { MarkNotificationsAsReadAction } from './actions/mark-notifications-as-read.action';
import { NotificationResource } from './resources/notification.resource';
import { ListNotificationsValidator } from './validators/list-notifications.validator';
import { ReadNotificationsValidator } from './validators/read-notifications.validator';
import { MarkAllNotificationsAsReadAction } from './actions/mark-all-notifications-as-read.action';

@Controller('/notifications')
@JwtAuth()
export class NotificationsController {
    public constructor(
        private readonly notificationsGetter: GetUserNotifications,
        private readonly reader: MarkNotificationsAsReadAction,
        private readonly allNotificationsReader: MarkAllNotificationsAsReadAction,
    ) {}

    @Get('/')
    @UsePipes(ListNotificationsValidator)
    public async list(
        @CurrentUser() user: User,
        @Query() { limit }: { limit?: number },
    ) {
        const notifications = await this.notificationsGetter.run(user, limit);

        return NotificationResource.collection(notifications);
    }

    @Post('/read')
    @UsePipes(ReadNotificationsValidator)
    public async read(
        @CurrentUser() user: User,
        @Body() { notifications }: { notifications: string[] },
    ) {
        await this.reader.run(user, notifications);
    }

    @Post('/read/all')
    public async readAll(@CurrentUser() user: User) {
        await this.allNotificationsReader.run(user);
    }
}