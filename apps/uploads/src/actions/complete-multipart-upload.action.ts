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
export class CompleteMultipartUploadAction {
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
        this.helper.ensureUploadIsntFinished(upload);
        await this.helper.ensureAllPartsAreUploaded(upload);

        await this.setUploadStatus(upload, UploadStatus.uploaded);

        this.completeInBackground(upload);

        return upload;
    }

    private async completeInBackground(upload: Upload): Promise<void> {
        try {
            const parts = await this.parts.find({
                where: {
                    uploadId: upload.id,
                },
                order: {
                    part: 'asc',
                },
            });

            await this.aws.completeUpload({
                Bucket: this.bucket,
                Key: upload.filename,
                UploadId: upload.publicId,
                Parts: parts.map(part => ({
                    PartNumber: part.part,
                    ETag: part.externalId,
                })),
            });

            await this.setUploadStatus(upload, UploadStatus.completed);
            await this.parts.delete({
                uploadId: upload.id,
            });
        } catch (error) {
            this.logger.error(`Failed to complete multipart upload [${upload.id}]: ${error?.message}`, { upload });
            this.logger.error(error);
        }
    }

    private setUploadStatus(upload: Upload, status: UploadStatus): Promise<Upload> {
        upload.status = status;

        return this.helper.lockUpload(upload, async (manager, upload) => {
            upload.status = status;

            await manager.save(upload);
        });
    }
}