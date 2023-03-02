import { ApplicationException } from './application.exception';

export class ForbiddenException extends ApplicationException {
    public constructor(message = 'Forbidden', data: object = {}) {
        super(message, data);
    }
}