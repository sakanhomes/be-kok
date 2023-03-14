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

@Module({
    imports: [TypeOrmModule.forFeature([Video, ViewHistory, Upload, UploadPart])],
    providers: [GetRandomVideosAction, CreateVideoAction, UpdateVideoAction],
    controllers: [VideosController],
})
export class VideosModule {}
