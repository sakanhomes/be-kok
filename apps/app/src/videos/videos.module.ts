import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetRandomVideosAction } from './actions/get-random-videos.action';
import { Video } from './video.model';
import { VideosController } from './videos.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Video])],
    providers: [GetRandomVideosAction],
    controllers: [VideosController],
})
export class VideosModule {}
