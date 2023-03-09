import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { LoggerService } from '@nestjs/common';
import { FileExcensionChecker } from './file-extension-checker';
import * as fs from 'fs';
import { randomString } from '@app/core/helpers';
import { Upload as UploadedFile } from './middleware/store-uploads-to-disk.middleware';

export class UploadsHelper {
    public constructor(private readonly logger?: LoggerService) {}

    public generateUploadId(): string {
        return randomString(64);
    }

    public async removeFileOrLog(filepath: string): Promise<void> {
        try {
            await fs.promises.unlink(filepath);
        } catch (error) {
            this.logger.error(`Failed to remove file [${filepath}]: ${error?.message}`, { filepath });
            this.logger.error(error);
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
}