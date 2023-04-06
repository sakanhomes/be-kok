import { BaseNotification } from '../../notifications/base.notification';
import { CanBeDisabled } from '../../notifications/interfaces/can-be-disabled.interface';
import { User } from '../../users/models/user.model';
import { Video } from '../models/video.model';

export class MentionNotification extends BaseNotification implements CanBeDisabled {
    public static readonly type = 'user.mention';
    public disableNotificationConfigKey = 'notifications.events.mention';

    public constructor(
        private readonly mentioner: User,
        private readonly video: Video,
    ) {
        super();
    }

    public getData(): Record<string, any> {
        return {
            mentionerName: this.mentioner.name ?? this.mentioner.address,
        };
    }

    public getParams(): Record<string, any> {
        return {
            user: this.makeUserParams(this.mentioner),
            video: this.makeVideoParams(this.video),
        };
    }
}