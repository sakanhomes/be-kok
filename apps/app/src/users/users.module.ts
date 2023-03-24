import { Upload } from '@app/common/uploads/models/upload.model';
import { forwardRef, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/models/account.model';
import { NotificationsModule } from '../notifications/notifications.module';
import { PlaylistsModule } from '../playlists/playlists.module';
import { Video } from '../videos/models/video.model';
import { ViewHistory } from '../videos/models/view-history.model';
import { CreateCurrentUserResourceAction } from './actions/create-current-user-resource.action';
import { GetFavouriteVideosAction } from './actions/get-favourite-videos.action';
import { GetUserSettingAction } from './actions/get-user-setting.action';
import { GetUserSettingsAction } from './actions/get-user-settings.action';
import { GetUserSubscribersAction } from './actions/get-user-subscribers.action';
import { GetUserSubscriptionsAction } from './actions/get-user-subscriptions.action';
import { GetUserVideos } from './actions/get-user-videos.action';
import { GetViewsHistoryAction } from './actions/get-views-history.action';
import { SearchUsersAction } from './actions/search-users.action';
import { SubscribeToUserAction } from './actions/subscribe-to-user.action';
import { UnsubscribeFromUserAction } from './actions/unsubscribe-from-user.action';
import { UpdateUserSettingsAction } from './actions/update-user-settings.action';
import { UpdateUserAction } from './actions/update-user.action';
import { USER_SETTINGS_CONFIG } from './constants';
import { Subscription } from './models/subscription.model';
import { UserSetting } from './models/user-setting.model';
import { User } from './models/user.model';
import { SubscriptionNotification } from './notifications/subscription.notification';
import { ProfilePlaylistsController } from './profile-playlists.controller';
import { ProfileController } from './profile.controller';
import { UsersController } from './users.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, UserSetting, Account, Video, Upload, Subscription, ViewHistory]),
        PlaylistsModule,
        forwardRef(() => NotificationsModule),
    ],
    providers: [
        UpdateUserAction,
        GetUserSettingAction,
        GetUserSettingsAction,
        UpdateUserSettingsAction,
        GetUserVideos,
        CreateCurrentUserResourceAction,
        SubscribeToUserAction,
        UnsubscribeFromUserAction,
        GetUserSubscribersAction,
        GetUserSubscriptionsAction,
        GetFavouriteVideosAction,
        GetViewsHistoryAction,
        SearchUsersAction,
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
    controllers: [
        ProfileController,
        ProfilePlaylistsController,
        UsersController,
    ],
})
export class UsersModule implements OnModuleInit {
    onModuleInit() {
        NotificationsModule.registerNotifications([
            SubscriptionNotification,
        ]);
    }
}
