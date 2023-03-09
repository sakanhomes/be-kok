import { HttpStatus } from '@nestjs/common';
import { BadRequestException } from './bad-request.exception';

export class PayloadTooLargeException extends BadRequestException {
    public constructor(
        public readonly limit: number | null = null,
        public readonly received: number | null = null,
    ) {
        super({ limit, received }, 'Payload Too Large', HttpStatus.PAYLOAD_TOO_LARGE);
    }
}