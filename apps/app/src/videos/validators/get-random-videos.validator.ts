import { Validator } from '@app/core/validation/validator';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';

export class GetRandomVideosValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            amount: Joi.number().required().min(1).max(25),
        });
    }
}