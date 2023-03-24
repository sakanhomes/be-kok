import { Upload } from '@app/common/uploads/models/upload.model';
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/models/account.model';
import { NotificationsModule } from '../notifications/notifications.module';
import { PlaylistsModule } from '../playlists/playlists.module';
import { Video } from '../videos/models/video.model';
import { ViewHistory } from '../videos/models/view-history.model';
import { VideosModule } from '../videos/videos.module';
import { CreateCurrentUserResourceAction } from './actions/create-current-user-resource.action';
import { GetFavouriteVideosAction } from './actions/get-favourite-videos.action';
import { GetUserSubscribersAction } from './actions/get-user-subscribers.action';
import { GetUserSubscriptionsAction } from './actions/get-user-subscriptions.action';
import { GetUserVideos } from './actions/get-user-videos.action';
import { GetViewsHistoryAction } from './actions/get-views-history.action';
import { SearchUsersAction } from './actions/search-users.action';
import { SubscribeToUserAction } from './actions/subscribe-to-user.action';
import { UnsubscribeFromUserAction } from './actions/unsubscribe-from-user.action';
import { UpdateUserAction } from './actions/update-user.action';
import { Subscription } from './models/subscription.model';
import { UserSetting } from '../user-settings/models/user-setting.model';
import { User } from './models/user.model';
import { SubscriptionNotification } from './notifications/subscription.notification';
import { ProfilePlaylistsController } from './profile-playlists.controller';
import { ProfileController } from './profile.controller';
import { UsersController } from './users.controller';
import { GetUserFlagsAction } from './actions/get-user-flags.action';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, UserSetting, Account, Video, Upload, Subscription, ViewHistory]),
        PlaylistsModule,
        NotificationsModule,
        VideosModule,
    ],
    providers: [
        UpdateUserAction,
        GetUserVideos,
        CreateCurrentUserResourceAction,
        SubscribeToUserAction,
        UnsubscribeFromUserAction,
        GetUserSubscribersAction,
        GetUserSubscriptionsAction,
        GetFavouriteVideosAction,
        GetViewsHistoryAction,
        SearchUsersAction,
        GetUserFlagsAction,
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
