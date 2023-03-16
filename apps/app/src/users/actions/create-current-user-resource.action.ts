import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../accounts/models/account.model';
import { User } from '../models/user.model';
import { CurrentUserResource } from '../resources/current-user.resource';

@Injectable()
export class CreateCurrentUserResourceAction {
    public constructor(
        @InjectRepository(Account)
        private readonly accounts: Repository<Account>,
    ) {}

    public async run(user: User): Promise<CurrentUserResource> {
        const account = await this.accounts.findOneBy({
            userId: user.id,
        });

        return new CurrentUserResource(user, account);
    }
}