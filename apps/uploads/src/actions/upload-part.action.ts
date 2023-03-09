import { AwsS3Service } from '@app/core/aws/aws-s3.service';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { UploadStatus } from '../enums/upload-status.enum';
import { Upload } from '../models/upload.model';
import { VIDEO_BUCKET } from '../constants';
import { Logger } from '@app/core/logging/decorators/logger.decorator';
import * as fs from 'fs';
import { UploadsHelper } from '../uploads.helper';
import { Upload as UploadedFile } from '../middleware/store-uploads-to-disk.middleware';
import { UploadPart } from '../models/upload-part.model';
import { PartStatus } from '../enums/part-status.enum';
import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { LockedCallback, ModelLocker } from '@app/core/orm/model-locker';

@Injectable()
export class UploadPartAction {
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
        this.helper = new UploadsHelper(this.logger);
    }

    public async run(upload: Upload, partNumber: number, file: UploadedFile): Promise<Upload> {
        await this.performChecks(upload, partNumber, file);

        const part = await this.getPartOrFail(upload, partNumber);

        part.status = PartStatus.uploading;
        await this.lockPart(part, async (manager, part) => {
            this.ensurePartCanBeUploaded(part);

            part.status = PartStatus.uploading;

            await manager.save(part);
        });

        this.uploadInBackground(upload, part, file.path);

        return upload;
    }

    private async uploadInBackground(upload: Upload, part: UploadPart, filepath: string): Promise<void> {
        let newPartStatus: PartStatus;

        try {
            const content = await fs.promises.readFile(filepath);

            await this.aws.uploadPart({
                Bucket: this.bucket,
                Key: upload.filename,
                UploadId: upload.publicId,
                PartNumber: part.part,
                ContentType: 'video/mp4',
                Metadata: {
                    owner: upload.owner,
                },
            }, Buffer.from(content));

            newPartStatus = PartStatus.uploaded;
        } catch (error) {
            this.logger.error(`Failed to upload part to AWS S3: ${error?.message}`, {
                upload,
            });
            this.logger.error(error);

            newPartStatus = PartStatus.failed;
        }

        part.status = newPartStatus;

        upload.status = UploadStatus.uploading;
        upload.lastChunkAt = new Date();

        await Promise.all([
            this.parts.save(part),
            this.uploads.save(upload),
            this.helper.removeFileOrLog(filepath),
        ]);
    }

    private async lockPart(part: UploadPart, callback: LockedCallback<UploadPart>): Promise<UploadPart> {
        return ModelLocker.using(this.parts.manager).lock(part, callback, ['uploadId', 'part']);
    }

    private async getPartOrFail(upload: Upload, part: number): Promise<UploadPart> {
        try {
            await this.parts.insert({
                uploadId: upload.id,
                part,
                status: PartStatus.created,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                upload: null,
            });
        } catch (error) {
            if (
                !(error instanceof QueryFailedError)
                || error.driverError.code !== 'ER_DUP_ENTRY'
            ) {
                throw error;
            }
        }

        const model = await this.parts.findOneBy({
            uploadId: upload.id,
            part,
        });

        this.ensurePartCanBeUploaded(model);

        return model;
    }

    private async performChecks(upload: Upload, part: number, file: UploadedFile): Promise<void> {
        try {
            this.helper.ensureContentIsNotEmpty(file);
            this.helper.ensureUploadIsntFinished(upload);
            this.helper.ensurePartNumberIsValid(upload, part);
            this.helper.ensureChunkSizeIsValid(upload, part, file.size);
        } catch (error) {
            await this.helper.removeFileOrLog(file.path);

            throw error;
        }
    }

    private ensurePartCanBeUploaded(part: UploadPart): void {
        if (![PartStatus.created, PartStatus.failed].includes(part.status)) {
            throw new UnprocessableException(`Part ${part.part} is already uploaded`);
        }
    }
}