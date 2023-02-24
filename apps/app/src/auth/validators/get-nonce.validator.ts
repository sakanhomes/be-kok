import { Validator } from '@app/core/validation/validator';
import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { ObjectSchema } from 'joi';

@Injectable()
export class GetNonceValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            address: Joi.string().min(34).max(42).required(),
        });
    }
}