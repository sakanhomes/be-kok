import { HttpStatus } from '@nestjs/common';
import { ServerErrorException } from './server-error.exception';

export class NotFoundException extends ServerErrorException {
    constructor(criteria: object = {}, message = 'Requested resource not found') {
        super({ criteria }, message, HttpStatus.NOT_FOUND);
    }
}
