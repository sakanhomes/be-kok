import { AwsS3Service } from '@app/core/aws/aws-s3.service';
import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { fileExtension, randomString } from '@app/core/helpers';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadStatus } from '../enums/upload-status.enum';
import { UploadType } from '../enums/upload-type.enum';
import { FileExcensionChecker } from '../file-extension-checker';
import { Upload } from '../models/upload.model';
import { VIDEO_BUCKET } from '../constants';
import { Logger } from '@app/core/logging/decorators/logger.decorator';
import * as fs from 'fs';

@Injectable()
export class UploadSingleFileAction {
    public constructor(
        @InjectRepository(Upload)
        private readonly uploads: Repository<Upload>,
        @Logger('uploads')
        private readonly logger: LoggerService,
        private readonly aws: AwsS3Service,
        @Inject(VIDEO_BUCKET)
        private readonly bucket: string,
    ) {}

    public async run(owner: string, name: string, filepath: string): Promise<Upload> {
        try {
            await this.ensureContentIsNotEmpty(filepath);
            this.ensureFileExtensionIsSupported(name);
        } catch (error) {
            await this.removeFileOrLog(filepath);

            throw error;
        }

        const id = randomString(64);
        const extension = fileExtension(name);
        const upload = this.uploads.create({
            id,
            owner,
            type: UploadType.single,
            status: UploadStatus.created,
            filename: `${id}.${extension}`,
        });

        await this.uploads.save(upload);

        this.uploadInBackground(upload, filepath);

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
            this.removeFileOrLog(filepath),
        ]);
    }

    private async removeFileOrLog(filepath: string): Promise<void> {
        try {
            await fs.promises.unlink(filepath);
        } catch (error) {
            this.logger.error(`Failed to remove file [${filepath}]: ${error?.message}`, { filepath });
            this.logger.error(error);
        }
    }

    private ensureFileExtensionIsSupported(name: string) {
        if (!FileExcensionChecker.isVideo(name)) {
            throw new UnprocessableException('Unsupported file type');
        }
    }

    private async ensureContentIsNotEmpty(filepath: string) {
        const stat = await fs.promises.stat(filepath);

        if (!stat.size) {
            throw new UnprocessableException('Empty payload');
        }
    }
}