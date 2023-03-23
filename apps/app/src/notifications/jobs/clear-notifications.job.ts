import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { subWeeks } from 'date-fns';
import { Repository } from 'typeorm';
import { Notification } from '../models/notification.model';

@Injectable()
export class ClearNotificationsJob {
    public constructor(
        @InjectRepository(Notification)
        private readonly notifications: Repository<Notification>,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    public async run(): Promise<void> {
        await this.notifications.createQueryBuilder()
            .delete()
            .where('createdAt < :deadline', { deadline: subWeeks(new Date, 1) })
            .execute();
    }
}