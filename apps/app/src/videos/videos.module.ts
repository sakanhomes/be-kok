import { Upload } from '@app/common/uploads/models/upload.model';
import { UploadPart } from '@app/common/uploads/models/upload-part.model';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateVideoAction } from './actions/create-video.action';
import { GetRandomVideosAction } from './actions/get-random-videos.action';
import { UpdateVideoAction } from './actions/update-video.action';
import { Video } from './models/video.model';
import { VideosController } from './videos.controller';
import { ViewHistory } from './models/view-history.model';
import { RecordViewAction } from './actions/record-view.action';
import { AccountsModule } from '../accounts/accounts.module';
import { AccountTransaction } from '../accounts/models/account-transaction.model';
import { Account } from '../accounts/models/account.model';
import { VIDEOS_CONFIG } from './constants';
import { ConfigService } from '@nestjs/config';
import { EnrollViewRewardAction } from './actions/enroll-view-reward.actions';
import { EnrollCreationRewardAction } from './actions/enroll-creation-reward.action';
import { DeleteVideoAction } from './actions/delete-video.action';
import { VideoLike } from './models/video-like.model';
import { AddVideoLikeAction } from './actions/add-video-like.action';
import { RemoveVideoLikeAction } from './actions/remove-video-like.action';
import { CreateVideoResourceAction } from './actions/create-video-resource.action';
import { User } from '../users/models/user.model';
import { VideoTrendingActivity } from './models/video-trending-activity.model';
import { VideoTrendingActivityHistory } from './models/video-trending-activity-history.model';
import { RecordTrendingActivityAction } from './actions/record-trending-activity.action';
import { GetTrendingActivityRecordAction } from './actions/get-trending-activity-record.action';
import { GetTrendingVideosAction } from './actions/get-trending-videos.action';
import { CommonController } from './common.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Video,
            ViewHistory,
            VideoLike,
            VideoTrendingActivity,
            VideoTrendingActivityHistory,
            Upload,
            UploadPart,
            Account,
            AccountTransaction,
        ]),
        AccountsModule,
    ],
    providers: [
        CreateVideoResourceAction,
        GetRandomVideosAction,
        GetTrendingVideosAction,
        CreateVideoAction,
        UpdateVideoAction,
        DeleteVideoAction,
        AddVideoLikeAction,
        RemoveVideoLikeAction,
        RecordViewAction,
        GetTrendingActivityRecordAction,
        RecordTrendingActivityAction,
        EnrollViewRewardAction,
        EnrollCreationRewardAction,
        {
            provide: VIDEOS_CONFIG,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => config.get('videos'),
        },
    ],
    controllers: [CommonController, VideosController],
})
export class VideosModule {}
