import { Validator } from '@app/core/validation/validator';
import { Injectable } from '@nestjs/common';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';

@Injectable()
export class UpdateUserSettingsValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object().pattern(
            /^[a-z\.\-_]+$/i,
            Joi.alternatives(
                Joi.string().required().max(250).trim(),
                Joi.number().required(),
                Joi.boolean().required().allow(null),
                Joi.object().required(),
            ),
        );
    }
}