import { ValidationException } from '@app/core/exceptions/app/validation.exception';
import { ParseUUIDPipe as OriginalPipe, ParseUUIDPipeOptions } from '@nestjs/common';

export class ParseUUIDPipe extends OriginalPipe {
    constructor(options?: ParseUUIDPipeOptions) {
        super(options);

        this.exceptionFactory = () =>
            new ValidationException({
                uuid: ['UUID is invalid'],
            });
    }
}
