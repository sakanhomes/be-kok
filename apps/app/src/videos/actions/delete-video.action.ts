import { AwsS3Service } from '@app/core/aws/aws-s3.service';
import { ModelLocker } from '@app/core/orm/model-locker';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { Video } from '../models/video.model';

@Injectable()
export class DeleteVideoAction {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private readonly aws: AwsS3Service,
    ) {}

    public async run(video: Video): Promise<void> {
        const creator = await this.users.findOneBy({
            id: video.userId,
        });

        await this.aws.delete({
            Bucket: video.previewImageBucket,
            Key: video.previewImageFile,
        });
        await this.aws.delete({
            Bucket: video.videoBucket,
            Key: video.videoFile,
        });

        await ModelLocker.using(this.users.manager).lock(creator, async (manager, creator) => {
            creator.videosAmount = Math.max(creator.videosAmount - 1, 0);

            await manager.remove(video);
            await manager.save(creator);
        });
    }
}