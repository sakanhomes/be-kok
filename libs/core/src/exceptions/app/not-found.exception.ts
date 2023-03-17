import { ApplicationException } from './application.exception';

export class NotFoundException extends ApplicationException {
    public constructor(message = 'Requested resource not found') {
        super(message);
    }
}
