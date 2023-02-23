import { ConsoleLogger } from '@nestjs/common';
import { Logger, createLogger, format, transports } from 'winston';
import { Format } from '../format';

export class ConsoleChannel extends ConsoleLogger {
    private logger: Logger;

    public constructor() {
        super();

        this.logger = createLogger({
            format: format.combine(
                Format.errors(),
                format.colorize({
                    level: true,
                }),
                Format.timestamp(),
                Format.template(),
            ),
            transports: [
                new transports.Console(),
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

    debug(message: any, context = {}): any {
        this.logger.debug(message, context);
    }

    verbose(message: any, context = {}): any {
        this.logger.verbose(message, context);
    }
}
