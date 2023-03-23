import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { Notification } from '../models/notification.model';

@Injectable()
export class GetUserNotifications {
    public constructor(
        @InjectRepository(Notification)
        private readonly notifications: Repository<Notification>,
    ) {}

    public async run(user: User, limit = 10): Promise<Notification[]> {
        return this.notifications.createQueryBuilder('notification')
            .where('notification.userId = :id', { id: user.id })
            .orderBy('if (notification.readAt, 1, 0)', 'ASC')
            .addOrderBy('notification.createdAt', 'DESC')
            .take(limit)
            .getMany();
    }
}