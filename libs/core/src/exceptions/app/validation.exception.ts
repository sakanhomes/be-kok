import { ErrorsContainer } from '@app/core/validation/errors-container';
import { UnprocessableException } from './unprocessable.exception';

export class ValidationException extends UnprocessableException {
    constructor(public readonly errors: ErrorsContainer, message = 'Given data was invalid') {
        super({ errors }, message);
    }
}
