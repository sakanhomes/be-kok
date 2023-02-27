import { Validator } from '@app/core/validation/validator';
import { Injectable } from '@nestjs/common';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';
import { String } from '@app/core/validation/helpers/string.helper';

@Injectable()
export class UpdateUserValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            name: Joi.string().optional().max(200),
            description: Joi.string().optional().max(500),
            profileImage: Joi.string().optional().max(250).custom(String.startsWith(['http://', 'https://'])),
            backgroundImage: Joi.string().optional().max(250).custom(String.startsWith(['http://', 'https://'])),
        });
    }
}