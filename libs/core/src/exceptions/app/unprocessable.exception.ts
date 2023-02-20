import { ApplicationException } from './application.exception';

export class UnprocessableException extends ApplicationException {
    constructor(data: object = {}, message = 'Unable to process') {
        super(data, message);
    }
}
