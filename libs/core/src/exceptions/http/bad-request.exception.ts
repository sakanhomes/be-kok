import { HttpStatus } from '@nestjs/common';
import { ServerErrorException } from './server-error.exception';

export class BadRequestException extends ServerErrorException {
    constructor(data: object = {}, message = 'Bad request', status: HttpStatus = HttpStatus.BAD_REQUEST) {
        super(data, message, status);
    }
}
