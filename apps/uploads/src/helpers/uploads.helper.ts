import { Upload } from '@app/common/uploads/models/upload.model';
import { UploadPart } from '@app/common/uploads/models/upload-part.model';
import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { LoggerService } from '@nestjs/common';
import { FileExtensionHelper } from './file-extension.helper';
import * as fs from 'fs';
import * as path from 'path';
import { fileExtension, randomString } from '@app/core/helpers';
import { UploadStatus } from '@app/common/uploads/enums/upload-status.enum';
import { Upload as UploadedFile } from '../middleware/store-uploads-to-disk.middleware';
import { LockedCallback, ModelLocker } from '@app/core/orm/model-locker';
import { Repository } from 'typeorm';
import { UploadPartStatus } from '@app/common/uploads/enums/upload-part-status.enum';
import { UploadType } from '@app/common/uploads/enums/upload-type.enum';
import { lookup } from 'mime-types';

type UploadsHelperOptions = {
    logger?: LoggerService,
    uploads?: Repository<Upload>,
    parts?: Repository<UploadPart>,
    config?: Record<string, any>,
}

type FileType = 'image' | 'video';

export class UploadsHelper {
    private readonly logger?: LoggerService;
    private readonly uploads?: Repository<Upload>;
    private readonly parts?: Repository<UploadPart>;
    private readonly config?: Record<string, any>;

    public constructor(options?: UploadsHelperOptions) {
        Object.assign(this, options ?? {});
    }

    public generateUploadId(): string {
        return randomString(64);
    }

    public getPartsAmount(upload: Upload): number {
        return Math.ceil(upload.size / upload.chunkSize);
    }

    public getMimeTypeOrFail(name: string): string {
        const mimeType = lookup(name);

        if (!mimeType) {
            throw new UnprocessableException(`Unable to lookup mimetype for file ${name}`);
        }

        return mimeType;
    }

    public getFileType(name: string): FileType {
        if (FileExtensionHelper.isVideo(name)) {
            return 'video';
        } else if (FileExtensionHelper.isImage(name)) {
            return 'image';
        }

        throw new UnprocessableException(`Unsupported file type: ${name}`);
    }

    public getCloudFilePath(owner: string, name: string, remoteName: string): string {
        const type = this.getFileType(name);
        const dir = this.config.directories[type];
        const extension = path.extname(name);

        return path.join(owner, dir, remoteName + extension);
    }

    public async removeFileOrLog(filepath: string): Promise<void> {
        try {
            await fs.promises.unlink(filepath);
        } catch (error) {
            this.logger.error(`Failed to remove file [${filepath}]: ${error?.message}`, { filepath });
            this.logger.error(error);
        }
    }

    public async allPartUploadsFinished(upload: Upload): Promise<void> {
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
        if (!FileExtensionHelper.isVideo(name) && !FileExtensionHelper.isImage(name)) {
            throw new UnprocessableException('Unsupported file type');
        }
    }

    public ensureFileIsVideo(name: string): void {
        if (!FileExtensionHelper.isVideo(name)) {
            throw new UnprocessableException('File must have a "video" type');
        }
    }

    public ensureContentIsNotEmpty(file: UploadedFile): void {
        if (!file.size) {
            throw new UnprocessableException('Empty payload');
        }
    }

    public ensureUploadIsntFinished(upload: Upload): void {
        if ([UploadStatus.completed, UploadStatus.aborted, UploadStatus.failed].includes(upload.status)) {
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