import { HttpStatus } from '@nestjs/common';
import { ServerErrorException } from './server-error.exception';

export class UnprocessableEntityException extends ServerErrorException {
    constructor(errors: object) {
        super({}, errors, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
