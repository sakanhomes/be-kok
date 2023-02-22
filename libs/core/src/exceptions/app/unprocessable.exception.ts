import { ApplicationException } from './application.exception';

export class UnprocessableException extends ApplicationException {
    constructor(message: string | null = null, params: object = {}) {
        super(message ?? 'Unable to process', { params });
    }
}
