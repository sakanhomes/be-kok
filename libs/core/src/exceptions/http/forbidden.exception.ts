import { HttpStatus } from '@nestjs/common';
import { ServerErrorException } from './server-error.exception';

export class ForbiddenException extends ServerErrorException {
    public constructor(data: object = {}, message = 'Forbidden') {
        super(data, message, HttpStatus.FORBIDDEN);
    }
}