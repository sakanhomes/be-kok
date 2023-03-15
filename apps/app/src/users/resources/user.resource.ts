import { onlyKeys } from '@app/core/helpers';
import { Resource } from '@app/core/http/resources/resource';

export class UserResource extends Resource {
    public static wrap = 'user';

    public constructor(private readonly user) {
        super();
    }

    public data(): Record<string, any> {
        return onlyKeys(this.user, [
            'address',
            'name',
            'profileImage',
            'backgroundImage',
            'description',
            'videosAmount',
            'followersAmount',
            'followingsAmount',
        ]);
    }
}