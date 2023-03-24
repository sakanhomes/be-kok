import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotifyUserAction } from '../../notifications/actions/notify-user.action';
import { User } from '../../users/models/user.model';
import { VideoActivity } from '../enums/video-activity.enum';
import { Video } from '../models/video.model';
import { VideoActivityNotification } from '../notifications/video-activity.notification';

@Injectable()
export class NotifyCreatorAboutVideoActivityAction {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private readonly notifier: NotifyUserAction,
    ) {}

    public async run(video: Video, user: User, activity: VideoActivity): Promise<void> {
        if (video.userId === user.id) {
            return;
        }

        const creator = video.user ?? await this.users.findOneBy({ id: video.userId });

        await this.notifier.run(creator, new VideoActivityNotification(video, user, activity));
    }
}