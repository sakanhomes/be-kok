import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { LoggerService } from '@nestjs/common';
import { FileExcensionChecker } from './file-extension-checker';
import * as fs from 'fs';
import { randomString } from '@app/core/helpers';

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

    public ensureFileExtensionIsSupported(name: string) {
        if (!FileExcensionChecker.isVideo(name)) {
            throw new UnprocessableException('Unsupported file type');
        }
    }

    public async ensureContentIsNotEmpty(filepath: string) {
        const stat = await fs.promises.stat(filepath);

        if (!stat.size) {
            throw new UnprocessableException('Empty payload');
        }
    }
}