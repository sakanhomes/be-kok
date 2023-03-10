import { AwsS3Service } from '@app/core/aws/aws-s3.service';
import { Logger } from '@app/core/logging/decorators/logger.decorator';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VIDEO_BUCKET } from '../constants';
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
            parts: this.parts,
        });
    }

    public async run(upload: Upload): Promise<Upload> {
        this.helper.ensureUploadIsMultipart(upload);

        await this.markUploadAsAborted(upload);

        this.abortInBackground(upload);

        return upload;
    }

    private async abortInBackground(upload: Upload): Promise<void> {
        try {
            await this.helper.allPartUploadsFinished(upload);
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

    private async markUploadAsAborted(upload: Upload): Promise<void> {
        upload.status = UploadStatus.aborted;

        await this.helper.lockUpload(upload, async (manager, upload) => {
            this.helper.ensureUploadIsntFinished(upload);

            upload.status = UploadStatus.aborted;

            await manager.save(upload);
        });
    }
}