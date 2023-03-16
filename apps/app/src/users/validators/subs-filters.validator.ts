import { Validator } from '@app/core/validation/validator';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';

export class SubsFiltersValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            search: Joi.string().trim().min(3).max(15).optional(),
        });
    }
}