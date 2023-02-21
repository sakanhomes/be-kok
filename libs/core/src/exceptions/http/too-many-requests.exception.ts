import { timestamp, unixtime } from '@app/core/helpers';
import { HttpStatus } from '@nestjs/common';
import { ServerErrorException } from './server-error.exception';

export class TooManyRequestsException extends ServerErrorException {
    public readonly retryAfter: number;

    constructor(retryAfter: Date | number, data: object = {}, message = 'Too many requests') {
        retryAfter = typeof retryAfter === 'number' ? retryAfter : unixtime(retryAfter);

        super(data, message, HttpStatus.TOO_MANY_REQUESTS, {
            headers: {
                'retry-after': retryAfter,
                'x-ratelimit-limit': 0,
                'x-ratelimit-remaining': 0,
                'x-ratelimit-reset': timestamp() + retryAfter,
            },
        });

        this.retryAfter = retryAfter;
    }
}
