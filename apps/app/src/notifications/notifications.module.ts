import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './models/notification.model';

@Module({
    imports: [TypeOrmModule.forFeature([Notification])],
})
export class NotificationsModule {}
