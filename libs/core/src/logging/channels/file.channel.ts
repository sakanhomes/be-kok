import { LoggerService } from '@nestjs/common';
import { Logger, createLogger, transports } from 'winston';
import { Format } from '../format';

export type FileChannelOptions = {
    file: string;
};

export class FileChannel implements LoggerService {
    private logger: Logger;

    public constructor(options: FileChannelOptions) {
        this.logger = createLogger({
            format: Format.default(),
            transports: [
                new transports.File({
                    filename: options.file,
                }),
            ],
        });
    }

    log(message: any, context = {}): any {
        this.logger.info(message, context);
    }

    error(message: any, context = {}): any {
        this.logger.error(message, context);
    }

    warn(message: any, context = {}): any {
        this.logger.warn(message, context);
    }

    debug?(message: any, context = {}): any {
        this.logger.debug(message, context);
    }

    verbose?(message: any, context = {}): any {
        this.logger.verbose(message, context);
    }
}
