import { Upload } from '@app/common/uploads/models/upload.model';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/models/account.model';
import { PlaylistsModule } from '../playlists/playlists.module';
import { Video } from '../videos/models/video.model';
import { CreateCurrentUserResourceAction } from './actions/create-current-user-resource.action';
import { GetFavouriteVideosAction } from './actions/get-favourite-videos.action';
import { GetUserSettingsAction } from './actions/get-user-settings.action';
import { GetUserSubscribersAction } from './actions/get-user-subscribers.action';
import { GetUserSubscriptionsAction } from './actions/get-user-subscriptions.action';
import { GetUserVideos } from './actions/get-user-videos.action';
import { SubscribeToUserAction } from './actions/subscribe-to-user.action';
import { UnsubscribeFromUserAction } from './actions/unsubscribe-from-user.action';
import { UpdateUserSettingsAction } from './actions/update-user-settings.action';
import { UpdateUserAction } from './actions/update-user.action';
import { USER_SETTINGS_CONFIG } from './constants';
import { Subscription } from './models/subscription.model';
import { UserSetting } from './models/user-setting.model';
import { User } from './models/user.model';
import { ProfilePlaylistsController } from './profile-playlists.controller';
import { ProfileController } from './profile.controller';
import { UsersController } from './users.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, UserSetting, Account, Video, Upload, Subscription]),
        PlaylistsModule,
    ],
    providers: [
        UpdateUserAction,
        GetUserSettingsAction,
        UpdateUserSettingsAction,
        GetUserVideos,
        CreateCurrentUserResourceAction,
        SubscribeToUserAction,
        UnsubscribeFromUserAction,
        GetUserSubscribersAction,
        GetUserSubscriptionsAction,
        GetFavouriteVideosAction,
        {
            provide: USER_SETTINGS_CONFIG,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => config.get('settings.userSettings'),
        },
    ],
    controllers: [
        ProfileController,
        ProfilePlaylistsController,
        UsersController,
    ],
})
export class UsersModule {}
