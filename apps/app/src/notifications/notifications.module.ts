import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotifyUserAction } from './actions/notify-user.action';
import { Notification } from './models/notification.model';

@Module({
    imports: [TypeOrmModule.forFeature([Notification])],
    providers: [
        NotifyUserAction,
    ],
    exports: [
        NotifyUserAction,
    ],
})
export class NotificationsModule {}
