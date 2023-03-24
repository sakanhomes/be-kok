import { Validator } from '@app/core/validation/validator';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';

export class ReadNotificationsValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            notifications: Joi.array().items(Joi.string().trim()).min(1).required(),
        });
    }
}