/* eslint-disable @typescript-eslint/no-unused-vars */

import { __ } from '@app/core/helpers';
import { User } from '../users/models/user.model';
import { makeAwsS3FileUrl } from '@app/core/aws/helpers';
import { Video } from '../videos/models/video.model';

export abstract class BaseNotification {
    public static readonly type: string;

    public getData(user?: User): Record<string, any> | null {
        return null;
    }

    public getParams(user?: User): Record<string, any> | null {
        return null;
    }

    public static toMessage(data?: Record<string, any>, user?: User): string {
        const type = (this as any).type;

        return __(`notifications.${type}`, {
            args: data,
        });
    }

    protected makeUserParams(user: User): Record<string, any> {
        return {
            address: user.address,
            name: user.name,
            profileImage: (user.profileImageBucket && user.profileImageFile)
                ? makeAwsS3FileUrl(user.profileImageBucket, user.profileImageFile)
                : null,
        };
    }

    protected makeVideoParams(video: Video): Record<string, any> {
        return {
            id: video.publicId,
            previewImage: makeAwsS3FileUrl(video.previewImageBucket, video.previewImageFile),
        };
    }
}