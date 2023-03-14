import { Validator } from '@app/core/validation/validator';
import { Injectable } from '@nestjs/common';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';
import { String } from '@app/core/validation/helpers/string.helper';

@Injectable()
export class UpdateUserValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            name: Joi.string().optional().trim().min(3).max(30),
            description: Joi.string().optional().allow(null, '').trim().max(500),
            profileImage: Joi.string().optional().trim().max(250).custom(String.startsWith(['http://', 'https://'])),
            backgroundImage: Joi.string().optional().trim().max(250).custom(String.startsWith(['http://', 'https://'])),
        });
    }
}