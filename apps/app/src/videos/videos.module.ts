import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetRandomVideosAction } from './actions/get-random-videos.action';
import { UpdateVideoAction } from './actions/update-video.action';
import { Video } from './models/video.model';
import { VideosController } from './videos.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Video])],
    providers: [GetRandomVideosAction, UpdateVideoAction],
    controllers: [VideosController],
})
export class VideosModule {}
