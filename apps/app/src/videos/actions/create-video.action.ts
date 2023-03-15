import { UploadStatus } from '@app/common/uploads/enums/upload-status.enum';
import { Upload } from '@app/common/uploads/models/upload.model';
import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { randomString, __ } from '@app/core/helpers';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../../users/models/user.model';
import { CreateVideoDto } from '../dtos/create-video.dto';
import { Category } from '../enums/category.enum';
import { Video } from '../models/video.model';

@Injectable()
export class CreateVideoAction {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
        @InjectRepository(Upload)
        private readonly uploads: Repository<Upload>,
    ) {}

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

            return createdVideo;
        });

        return video;
    }

    private async getPreviewUploadOrFail(user: User, id: string): Promise<Upload> {
        const upload = await this.uploads.findOneBy({
            publicId: id,
            owner: user.address,
            mimetype: In(['image/jpeg', 'image/png']),
            status: UploadStatus.completed,
        });

        if (!upload) {
            throw new UnprocessableException(__('errors.upload-not-found', {
                args: { type: 'Preview' },
            }));
        }

        return upload;
    }

    private async getVideoUploadOrFail(user: User, id: string): Promise<Upload> {
        const upload = await this.uploads.findOneBy({
            publicId: id,
            owner: user.address,
            mimetype: 'video/mp4',
            status: UploadStatus.completed,
        });

        if (!upload) {
            throw new UnprocessableException(__('errors.upload-not-found', {
                args: { type: 'Video' },
            }));
        }

        return upload;
    }
}