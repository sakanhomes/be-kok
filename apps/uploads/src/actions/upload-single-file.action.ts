import { Upload } from '@app/common/uploads/models/upload.model';
import { AwsS3Service } from '@app/core/aws/aws-s3.service';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadStatus } from '@app/common/uploads/enums/upload-status.enum';
import { UploadType } from '@app/common/uploads/enums/upload-type.enum';
import { UPLOADS_CONFIG } from '../constants';
import { Logger } from '@app/core/logging/decorators/logger.decorator';
import * as fs from 'fs';
import { UploadsHelper } from '../helpers/uploads.helper';
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
        @Inject(UPLOADS_CONFIG)
        private readonly config: Record<string, any>,
    ) {
        this.helper = new UploadsHelper({ config: this.config });
    }

    public async run(owner: string, name: string, file: UploadedFile): Promise<Upload> {
        try {
            this.helper.ensureContentIsNotEmpty(file);
            this.helper.ensureFileExtensionIsSupported(name);

            const id = this.helper.generateUploadId();
            const cloudFilePath = this.helper.getCloudFilePath(owner, name, id);

            const upload = this.uploads.create({
                publicId: id,
                owner,
                type: UploadType.single,
                status: UploadStatus.created,
                bucket: this.config.awsBucket,
                file: cloudFilePath,
                mimetype: this.helper.getMimeTypeOrFail(name),
                size: file.size,
            });

            await this.uploads.save(upload);

            this.uploadInBackground(upload, file.path);

            return upload;
        } catch (error) {
            await this.helper.removeFileOrLog(file.path);

            throw error;
        }
    }

    private async uploadInBackground(upload: Upload, filepath: string): Promise<void> {
        try {
            const content = await fs.promises.readFile(filepath);

            await this.aws.upload({
                Bucket: upload.bucket,
                Key: upload.file,
                ContentType: upload.mimetype,
                Metadata: {
                    owner: upload.owner,
                },
            }, content);

            upload.status = UploadStatus.completed;
        } catch (error) {
            this.logger.error(`Failed to upload single file to AWS S3: ${error?.message}`, {
                upload,
            });
            this.logger.error(error);

            upload.status = UploadStatus.failed;
        }

        await Promise.all([
            this.uploads.save(upload),
            this.helper.removeFileOrLog(filepath),
        ]);
    }
}