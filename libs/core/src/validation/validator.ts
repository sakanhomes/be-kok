import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { ValidationError, ObjectSchema, ValidationErrorItem } from 'joi';
import { ValidationException } from '../exceptions/app/validation.exception';
import { ErrorsContainer } from './errors-container';

export abstract class Validator implements PipeTransform {
    async transform(data: any, metadata: ArgumentMetadata) {
        if (!this.isValidatable(data, metadata)) {
            return data;
        }

        try {
            return await this.schema().validateAsync(data, {
                abortEarly: false,
                stripUnknown: true,
            });
        } catch (error) {
            if (!(error instanceof ValidationError)) {
                throw error;
            }

            this.throwValidationError(error);
        }
    }

    protected abstract schema(): ObjectSchema;

    protected isValidatable(data: any, metadata: ArgumentMetadata): boolean {
        const allowedTypes = ['body', 'query'];

        // For now Validator supports only validation of query or body
        return allowedTypes.includes(metadata.type);
    }

    protected makeValidationException(errors: ErrorsContainer): any {
        return new ValidationException(errors);
    }

    private throwValidationError(error: ValidationError) {
        const errors = this.groupErrors(error.details);

        throw this.makeValidationException(errors);
    }

    private groupErrors(details: ValidationErrorItem[]): ErrorsContainer {
        const errors = {};

        details.forEach((error) => {
            const path = error.path.join('.');

            if (!errors[path]) {
                errors[path] = error.message;
            }
        });

        return errors;
    }
}
