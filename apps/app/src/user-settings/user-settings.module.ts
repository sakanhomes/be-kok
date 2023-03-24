import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetUserSettingAction } from './actions/get-user-setting.action';
import { GetUserSettingsAction } from './actions/get-user-settings.action';
import { UpdateUserSettingsAction } from './actions/update-user-settings.action';
import { USER_SETTINGS_CONFIG } from './constants';
import { UserSetting } from './models/user-setting.model';
import { UserSettingsController } from './user-settings.controller';

@Module({
    imports: [TypeOrmModule.forFeature([UserSetting])],
    providers: [
        GetUserSettingAction,
        GetUserSettingsAction,
        UpdateUserSettingsAction,
        {
            provide: USER_SETTINGS_CONFIG,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => config.get('settings.userSettings'),
        },
    ],
    exports: [
        GetUserSettingAction,
        GetUserSettingsAction,
    ],
    controllers: [UserSettingsController],
})
export class UserSettingsModule {}
