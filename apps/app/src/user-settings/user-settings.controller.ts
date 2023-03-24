import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { JwtAuth } from '@app/core/auth/decorators/jwt-auth.decorator';
import { Body, Controller, Get, Patch, UsePipes } from '@nestjs/common';
import { User } from '../users/models/user.model';
import { GetUserSettingsAction } from './actions/get-user-settings.action';
import { UpdateUserSettingsAction } from './actions/update-user-settings.action';
import { UpdateUserSettingsValidator } from './validators/update-user-settings.validator';

@Controller('/me/settings')
@JwtAuth()
export class UserSettingsController {
    public constructor(
        private readonly settingsGetter: GetUserSettingsAction,
        private readonly settingsUpdater: UpdateUserSettingsAction,
    ) {}

    @Get('/')
    public async getSettings(@CurrentUser() user: User) {
        const settings = await this.settingsGetter.run(user);

        return { settings };
    }

    @Patch('/')
    @UsePipes(UpdateUserSettingsValidator)
    public async updateSettings(@CurrentUser() user: User, @Body() data) {
        await this.settingsUpdater.run(user, data);

        const settings = await this.settingsGetter.run(user);

        return { settings };
    }
}
