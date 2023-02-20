import { HttpStatus } from '@nestjs/common';
import { ServerErrorException } from './server-error.exception';

export class UnauthorizedException extends ServerErrorException {
    constructor(message = 'Unauthorized') {
        super({}, message, HttpStatus.UNAUTHORIZED);
    }
}
