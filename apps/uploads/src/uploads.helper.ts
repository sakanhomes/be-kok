import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { LoggerService } from '@nestjs/common';
import { FileExcensionChecker } from './file-extension-checker';
import * as fs from 'fs';
import { randomString } from '@app/core/helpers';
import { Upload } from './models/upload.model';
import { UploadStatus } from './enums/upload-status.enum';
import { Upload as UploadedFile } from './middleware/store-uploads-to-disk.middleware';
import { UploadPart } from './models/upload-part.model';
import { LockedCallback, ModelLocker } from '@app/core/orm/model-locker';
import { Repository } from 'typeorm';
import { UploadPartStatus } from './enums/upload-part-status.enum';
import { UploadType } from './enums/upload-type.enum';

type UploadsHelperOptions = {
    logger?: LoggerService,
    uploads?: Repository<Upload>,
    parts?: Repository<UploadPart>,
}

export class UploadsHelper {
    private readonly logger?: LoggerService;
    private readonly uploads?: Repository<Upload>;
    private readonly parts?: Repository<UploadPart>;

    public constructor(options?: UploadsHelperOptions) {
        Object.assign(this, options ?? {});
    }

    public generateUploadId(): string {
        return randomString(64);
    }

    public getPartsAmount(upload: Upload): number {
        return Math.ceil(upload.size / upload.chunkSize);
    }

    public async removeFileOrLog(filepath: string): Promise<void> {
        try {
            await fs.promises.unlink(filepath);
        } catch (error) {
            this.logger.error(`Failed to remove file [${filepath}]: ${error?.message}`, { filepath });
            this.logger.error(error);
        }
    }

    public async lockUpload(upload: Upload, callback: LockedCallback<Upload>): Promise<Upload> {
        return ModelLocker.using(this.uploads.manager).lock(upload, callback);
    }

    public async lockPart(part: UploadPart, callback: LockedCallback<UploadPart>): Promise<UploadPart> {
        return ModelLocker.using(this.parts.manager).lock(part, callback, ['uploadId', 'part']);
    }

    public async ensureAllPartsAreUploaded(upload: Upload): Promise<void> {
        const uploadedPartsAmount = await this.parts.countBy({
            uploadId: upload.id,
            status: UploadPartStatus.uploaded,
        });

        if (uploadedPartsAmount !== this.getPartsAmount(upload)) {
            throw new UnprocessableException('File is not yet completely uploaded');
        }
    }

    public ensureFileExtensionIsSupported(name: string): void {
        if (!FileExcensionChecker.isVideo(name)) {
            throw new UnprocessableException('Unsupported file type');
        }
    }

    public ensureContentIsNotEmpty(file: UploadedFile): void {
        if (!file.size) {
            throw new UnprocessableException('Empty payload');
        }
    }

    public ensureUploadIsntFinished(upload: Upload): void {
        if ([UploadStatus.completed, UploadStatus.aborted].includes(upload.status)) {
            throw new UnprocessableException('Upload is already finished');
        }
    }

    public ensureUploadIsMultipart(upload: Upload): void {
        if (upload.type !== UploadType.multipart) {
            throw new UnprocessableException('Upload must be of type "multipart"');
        }
    }

    public ensurePartNumberIsValid(upload: Upload, part: number): void {
        const totalParts = this.getPartsAmount(upload);

        if (part >= totalParts) {
            throw new UnprocessableException('Invalid chunk number', {
                totalParts,
            });
        }
    }

    public ensureChunkSizeIsValid(upload: Upload, chunkNumber: number, chunkSize: number): void {
        const totalParts = this.getPartsAmount(upload);

        if (chunkNumber === totalParts - 1) {
            return;
        }

        if (chunkSize !== upload.chunkSize) {
            throw new UnprocessableException('Invalid chunk size', {
                requiredChunkSize: upload.chunkSize,
                actualChunkSize: chunkSize,
            });
        }
    }
}