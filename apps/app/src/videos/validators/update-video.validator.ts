import { Validator } from '@app/core/validation/validator';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';

export class UpdateVideoValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            isPublic: Joi.boolean().optional(),
        });
    }
}