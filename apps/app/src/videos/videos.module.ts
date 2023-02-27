import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './video.model';
import { VideosController } from './videos.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Video])],
    controllers: [VideosController],
})
export class VideosModule {}
