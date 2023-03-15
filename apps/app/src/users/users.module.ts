import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/models/account.model';
import { Video } from '../videos/models/video.model';
import { GetUserSettingsAction } from './actions/get-user-settings.action';
import { GetUserVideos } from './actions/get-user-videos.action';
import { SubscribeToUserAction } from './actions/subscribe-to-user.action';
import { UnsubscribeFromUserAction } from './actions/unsubscribe-from-user.action copy';
import { UpdateUserSettingsAction } from './actions/update-user-settings.action';
import { UpdateUserAction } from './actions/update-user.action';
import { USER_SETTINGS_CONFIG } from './constants';
import { Subscription } from './models/subscription.model';
import { UserSetting } from './models/user-setting.model';
import { User } from './models/user.model';
import { ProfileController } from './profile.controller';
import { UsersController } from './users.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User, UserSetting, Account, Video, Subscription])],
    providers: [
        UpdateUserAction,
        GetUserSettingsAction,
        UpdateUserSettingsAction,
        GetUserVideos,
        SubscribeToUserAction,
        UnsubscribeFromUserAction,
        {
            provide: USER_SETTINGS_CONFIG,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => config.get('settings.userSettings'),
        },
    ],
    controllers: [ProfileController, UsersController],
})
export class UsersModule {}
