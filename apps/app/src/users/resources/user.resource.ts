import { makeAwsS3FileUrl } from '@app/core/aws/helpers';
import { onlyKeys } from '@app/core/helpers';
import { Resource } from '@app/core/http/resources/resource';

export class UserResource extends Resource {
    public static wrap = 'user';

    public constructor(private readonly user) {
        super();
    }

    public data(): Record<string, any> {
        const resource = onlyKeys(this.user, [
            'address',
            'name',
            'description',
            'videosAmount',
            'subscribersAmount',
            'subscriptionsAmount',
        ]);

        Object.assign(resource, {
            profileImage: (this.user.profileImageBucket && this.user.profileImageFile)
                ? makeAwsS3FileUrl(this.user.profileImageBucket, this.user.profileImageFile)
                : null,
            backgroundImage: (this.user.backgroundImageBucket && this.user.backgroundImageFile)
                ? makeAwsS3FileUrl(this.user.backgroundImageBucket, this.user.backgroundImageFile)
                : null,
        });

        return resource;
    }
}