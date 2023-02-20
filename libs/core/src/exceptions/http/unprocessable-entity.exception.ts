import { HttpStatus } from '@nestjs/common';
import { BadRequestException } from './bad-request.exception';

export class UnprocessableEntityException extends BadRequestException {
    constructor(data: object = {}, message = 'Given data was invalid') {
        super(data, message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
