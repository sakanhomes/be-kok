import { makeAwsS3FileUrl } from '@app/core/aws/helpers';
import { onlyKeys } from '@app/core/helpers';
import { Resource } from '@app/core/http/resources/resource';
import { User } from '../models/user.model';

export class BasicUserResource extends Resource {
    public static wrap = 'user';

    public constructor(private readonly user: User) {
        super();
    }

    public data(): Record<string, any> {
        const resource = onlyKeys(this.user, [
            'address',
            'name',
            'videosAmount',
            'subscribersAmount',
            'subscriptionsAmount',
        ]);

        Object.assign(resource, {
            profileImage: (this.user.profileImageBucket && this.user.profileImageFile)
                ? makeAwsS3FileUrl(this.user.profileImageBucket, this.user.profileImageFile)
                : null,
        });

        return resource;
    }
}