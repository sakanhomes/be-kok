import { AwsS3Service } from '@app/core/aws/aws-s3.service';
import { fileExtension } from '@app/core/helpers';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadStatus } from '../enums/upload-status.enum';
import { UploadType } from '../enums/upload-type.enum';
import { Upload } from '../models/upload.model';
import { VIDEO_BUCKET } from '../constants';
import { Logger } from '@app/core/logging/decorators/logger.decorator';
import * as fs from 'fs';
import { UploadsHelper } from '../uploads.helper';
import { Upload as UploadedFile } from '../middleware/store-uploads-to-disk.middleware';

@Injectable()
export class UploadSingleFileAction {
    private readonly helper: UploadsHelper;

    public constructor(
        @InjectRepository(Upload)
        private readonly uploads: Repository<Upload>,
        @Logger('uploads')
        private readonly logger: LoggerService,
        private readonly aws: AwsS3Service,
        @Inject(VIDEO_BUCKET)
        private readonly bucket: string,
    ) {
        this.helper = new UploadsHelper;
    }

    public async run(owner: string, name: string, file: UploadedFile): Promise<Upload> {
        try {
            this.helper.ensureContentIsNotEmpty(file);
            this.helper.ensureFileExtensionIsSupported(name);
        } catch (error) {
            await this.helper.removeFileOrLog(file.path);

            throw error;
        }

        const id = this.helper.generateUploadId();
        const extension = fileExtension(name);
        const upload = this.uploads.create({
            publicId: id,
            owner,
            type: UploadType.single,
            status: UploadStatus.created,
            filename: `${id}.${extension}`,
        });

        await this.uploads.save(upload);

        this.uploadInBackground(upload, file.path);

        return upload;
    }

    private async uploadInBackground(upload: Upload, filepath: string): Promise<void> {
        try {
            const content = await fs.promises.readFile(filepath);

            await this.aws.upload({
                Bucket: this.bucket,
                Key: upload.filename,
                ContentType: 'video/mp4',
                Metadata: {
                    owner: upload.owner,
                },
            }, Buffer.from(content));

            upload.status = UploadStatus.completed;
        } catch (error) {
            this.logger.error(`Failed to upload single file to AWS S3: ${error?.message}`, {
                upload,
            });
            this.logger.error(error);

            upload.status = UploadStatus.failed;
        }

        Promise.all([
            this.uploads.save(upload),
            this.helper.removeFileOrLog(filepath),
        ]);
    }
}