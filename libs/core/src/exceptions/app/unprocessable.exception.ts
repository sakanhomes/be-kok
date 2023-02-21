import { ApplicationException } from './application.exception';

export class UnprocessableException extends ApplicationException {
    constructor(params: object = {}, message = 'Unable to process') {
        super({ params }, message);
    }
}
