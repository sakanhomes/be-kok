import { Upload } from '@app/common/uploads/models/upload.model';
import { randomString } from '@app/core/helpers';
import { ModelLocker } from '@app/core/orm/model-locker';
import { UploadsFinder } from '@app/core/support/uploads/uploads-finder';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { CreateVideoDto } from '../dtos/create-video.dto';
import { Category } from '../enums/category.enum';
import { Video } from '../models/video.model';

@Injectable()
export class CreateVideoAction {
    private readonly uploadsFinder: UploadsFinder;

    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
        @InjectRepository(Upload)
        private readonly uploads: Repository<Upload>,
    ) {
        this.uploadsFinder = new UploadsFinder(this.uploads);
    }

    public async run(user: User, data: CreateVideoDto): Promise<Video> {
        const previewUpload = await this.getPreviewUploadOrFail(user, data.previewUploadId);
        const videoUpload = await this.getVideoUploadOrFail(user, data.videoUploadId);

        let video = this.videos.create({
            publicId: randomString(16),
            categoryId: Category[data.category],
            title: data.title,
            duration: '00:00',
            description: data.description,
            previewImageBucket: previewUpload.bucket,
            previewImageFile: previewUpload.file,
            videoBucket: videoUpload.bucket,
            videoFile: videoUpload.file,
            isPublic: data.isPublic,
        });

        video.user = user;

        video = await this.videos.manager.transaction(async (manager) => {
            const createdVideo = await manager.save(video);

            await manager.remove(previewUpload);
            await manager.remove(videoUpload);

            await ModelLocker.using(manager).lock(user, async (manager, user) => {
                user.videosAmount++;

                await manager.save(user);
            });

            return createdVideo;
        });

        return video;
    }

    private getPreviewUploadOrFail(user: User, id: string): Promise<Upload> {
        return this.uploadsFinder.findUploadOrFail(user, id, ['image/jpeg', 'image/png'], 'Preview');
    }

    private getVideoUploadOrFail(user: User, id: string): Promise<Upload> {
        return this.uploadsFinder.findUploadOrFail(user, id, ['video/mp4'], 'Video');
    }
}