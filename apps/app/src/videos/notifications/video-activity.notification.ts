import { makeAwsS3FileUrl } from '@app/core/aws/helpers';
import { __ } from '@app/core/helpers';
import { BaseNotification } from '../../notifications/base.notification';
import { CanBeDisabled } from '../../notifications/interfaces/can-be-disabled.interface';
import { User } from '../../users/models/user.model';
import { VideoActivity } from '../enums/video-activity.enum';
import { Video } from '../models/video.model';

export class VideoActivityNotification extends BaseNotification implements CanBeDisabled {
    public static readonly type = 'video.activity';
    public readonly disableNotificationConfigKey = 'notifications.events.channel-activity';

    public constructor(
        private readonly video: Video,
        private readonly user: User,
        private readonly activity: VideoActivity,
    ) {
        super();
    }

    public getData(): Record<string, any> {
        return {
            userName: this.user.name ?? this.user.address,
            activity: this.activity,
        };
    }

    public getParams(): Record<string, any> {
        return {
            videoPreviewImage: makeAwsS3FileUrl(this.video.previewImageBucket, this.video.previewImageFile),
        };
    }

    public static toMessage(data: Record<string, any>, user?: User): string {
        const activityKey = VideoActivity[data.activity].toLowerCase();
        const activityName = __('notifications.video.activities')[activityKey];

        return super.toMessage({
            userName: data.userName,
            activity: activityName,
        }, user);
    }
}