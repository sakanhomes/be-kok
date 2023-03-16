import { onlyKeys } from '@app/core/helpers';
import { Resource } from '@app/core/http/resources/resource';
import { Account } from '../../accounts/models/account.model';
import { User } from '../models/user.model';

export class CurrentUserResource extends Resource {
    public static wrap = 'user';

    public constructor(private readonly user: User, private readonly account?: Account) {
        super();
    }

    public data(): Record<string, any> {
        const resource = onlyKeys(this.user, [
            'address',
            'name',
            'profileImage',
            'backgroundImage',
            'description',
            'videosAmount',
            'followersAmount',
            'followingsAmount',
        ]);

        Object.assign(resource, {
            balance: this.account ? this.account.balance.toNumber() : 0,
        });

        return resource;
    }
}