import { Inject } from '@nestjs/common';
import { LOGGER } from '../logging.module';

export function Logger(name: string = LOGGER) {
    return Inject(name === LOGGER ? name : `logger.${name}`);
}