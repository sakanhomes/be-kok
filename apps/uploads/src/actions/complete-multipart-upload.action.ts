import { Upload } from '@app/common/uploads/models/upload.model';
import { UploadPart } from '@app/common/uploads/models/upload-part.model';
import { AwsS3Service } from '@app/core/aws/aws-s3.service';
import { Logger } from '@app/core/logging/decorators/logger.decorator';
import { Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadStatus } from '@app/common/uploads/enums/upload-status.enum';
import { UploadsHelper } from '../helpers/uploads.helper';

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
    ) {
        this.helper = new UploadsHelper({
            logger: this.logger,
            uploads: this.uploads,
            parts: this.parts,
        });
    }

    public async run(upload: Upload): Promise<Upload> {
        this.helper.ensureUploadIsMultipart(upload);
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
                Bucket: upload.bucket,
                Key: upload.file,
                UploadId: upload.publicId,
                Parts: parts.map(part => ({
                    // AWS start counting from 1, but in our db parts are numbered from 0
                    PartNumber: part.part + 1,
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