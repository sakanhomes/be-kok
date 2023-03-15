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

@Module({
    imports: [
        TypeOrmModule.forFeature([Video, ViewHistory, VideoLike, Upload, UploadPart, Account, AccountTransaction]),
        AccountsModule,
    ],
    providers: [
        GetRandomVideosAction,
        CreateVideoAction,
        UpdateVideoAction,
        DeleteVideoAction,
        RecordViewAction,
        EnrollViewRewardAction,
        EnrollCreationRewardAction,
        {
            provide: VIDEOS_CONFIG,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => config.get('videos'),
        },
    ],
    controllers: [VideosController],
})
export class VideosModule {}
