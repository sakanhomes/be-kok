import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { JwtAuth } from '@app/core/auth/decorators/jwt-auth.decorator';
import { onlyKeys } from '@app/core/helpers';
import { Body, Controller, Get, Patch, UsePipes } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../accounts/models/account.model';
import { GetUserSettingsAction } from './actions/get-user-settings.action';
import { UpdateUserSettingsAction } from './actions/update-user-settings.action';
import { UpdateUserAction } from './actions/update-user.action';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './models/user.model';
import { UpdateUserSettingsValidator } from './validators/update-user-settings.validator';
import { UpdateUserValidator } from './validators/update-user.validator';

@Controller('/me')
@JwtAuth()
export class ProfileController {
    public constructor(
        @InjectRepository(Account)
        private readonly accounts: Repository<Account>,
        private readonly updater: UpdateUserAction,
        private readonly settingsGetter: GetUserSettingsAction,
        private readonly settingsUpdater: UpdateUserSettingsAction,
    ) {}

    @Get('/')
    public user(@CurrentUser() user: User) {
        return this.userResponse(user);
    }

    @Patch('/')
    @UsePipes(UpdateUserValidator)
    public async update(@CurrentUser() user: User, @Body() data: UpdateUserDto) {
        await this.updater.run(user, data);

        return this.userResponse(user);
    }

    @Get('/settings')
    public async getSettings(@CurrentUser() user: User) {
        const settings = await this.settingsGetter.run(user);

        return { settings };
    }

    @Patch('/settings')
    @UsePipes(UpdateUserSettingsValidator)
    public async updateSettings(@CurrentUser() user: User, @Body() data) {
        await this.settingsUpdater.run(user, data);
    }

    private async userResponse(user: User) {
        const resource = onlyKeys(user, ['address', 'name', 'profileImage', 'backgroundImage', 'description']);
        const account: Account | null = await this.accounts.createQueryBuilder()
            .relation(User, 'accounts')
            .of(user)
            .loadOne();

        Object.assign(resource, {
            balance: account ? account.balance.toNumber() : 0,
        });

        return {
            user: resource,
        };
    }
}
