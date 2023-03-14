import { Validator } from '@app/core/validation/validator';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';
import { String } from '@app/core/validation/helpers/string.helper';

export class CreateMulipartUploadValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            name: Joi.string().required().max(250).custom(String.filename()),
            size: Joi.number().required().integer().min(1).max(Number.MAX_SAFE_INTEGER),
        });
    }
}