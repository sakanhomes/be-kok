import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { Notification } from '../models/notification.model';

@Injectable()
export class MarkNotificationsAsReadAction {
    public constructor(
        @InjectRepository(Notification)
        private readonly notifications: Repository<Notification>,
    ) {}

    public async run(user: User, ids: string[]): Promise<void> {
        const idsList = ids.map(id => `"${id}"`).join(',');

        await this.notifications.createQueryBuilder()
            .update()
            .set({
                readAt: new Date,
            }).where('userId = :id', { id: user.id })
            .andWhere(`publicId in (${idsList})`)
            .execute();
    }
}