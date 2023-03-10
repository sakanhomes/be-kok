import { AwsS3Service } from '@app/core/aws/aws-s3.service';
import { Logger } from '@app/core/logging/decorators/logger.decorator';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VIDEO_BUCKET } from '../constants';
import { UploadPartStatus } from '../enums/upload-part-status.enum';
import { UploadStatus } from '../enums/upload-status.enum';
import { UploadPart } from '../models/upload-part.model';
import { Upload } from '../models/upload.model';
import { UploadsHelper } from '../uploads.helper';

@Injectable()
export class AbortMultipartUploadAction {
    private readonly helper: UploadsHelper;

    public constructor(
        @InjectRepository(Upload)
        private readonly uploads: Repository<Upload>,
        @InjectRepository(UploadPart)
        private readonly parts: Repository<UploadPart>,
        @Logger('uploads')
        private readonly logger: LoggerService,
        private readonly aws: AwsS3Service,
        @Inject(VIDEO_BUCKET)
        private readonly bucket: string,
    ) {
        this.helper = new UploadsHelper({
            logger: this.logger,
            uploads: this.uploads,
        });
    }

    public async run(upload: Upload): Promise<Upload> {
        await this.markUploadAsAborted(upload);

        this.abortInBackground(upload);

        return upload;
    }

    private async abortInBackground(upload: Upload): Promise<void> {
        try {
            await this.allPartUploadsFinished(upload);
            await this.aws.abortUpload({
                Bucket: this.bucket,
                Key: upload.filename,
                UploadId: upload.publicId,
            });
            await Promise.all([
                this.parts.delete({
                    uploadId: upload.id,
                }),
                this.uploads.remove(upload),
            ]);
        } catch (error) {
            this.logger.error(`Failed to abort upload [${upload.id}]: ${error?.message}`, { upload });
            this.logger.error(error);
        }
    }

    private async allPartUploadsFinished(upload: Upload): Promise<void> {
        const uploadingParts = await this.getUploadingParts(upload);

        if (!uploadingParts.length) {
            return;
        }

        await new Promise<void>((resolve, reject) => {
            let processing = false;

            const interval = setInterval(async () => {
                if (processing) {
                    return;
                }

                processing = true;

                try {
                    const uploadingParts = await this.getUploadingParts(upload);

                    if (uploadingParts.length) {
                        processing = false;

                        return;
                    }

                    clearInterval(interval);
                    resolve();
                } catch (error) {
                    reject(error);

                    return;
                }
            }, 1000);
        });
    }

    private getUploadingParts(upload: Upload): Promise<UploadPart[]> {
        return this.parts.findBy({
            uploadId: upload.id,
            status: UploadPartStatus.uploading,
        });
    }

    private async markUploadAsAborted(upload: Upload): Promise<void> {
        upload.status = UploadStatus.aborted;

        await this.helper.lockUpload(upload, async (manager, upload) => {
            this.helper.ensureUploadIsntFinished(upload);

            upload.status = UploadStatus.aborted;

            await manager.save(upload);
        });
    }
}