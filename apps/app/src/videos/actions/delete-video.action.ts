import { AwsS3Service } from '@app/core/aws/aws-s3.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../models/video.model';

@Injectable()
export class DeleteVideoAction {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
        private readonly aws: AwsS3Service,
    ) {}

    public async run(video: Video): Promise<void> {
        await this.aws.delete({
            Bucket: video.previewImageBucket,
            Key: video.previewImageFile,
        });
        await this.aws.delete({
            Bucket: video.videoBucket,
            Key: video.videoFile,
        });
        await this.videos.remove(video);
    }
}