import { Validator } from '@app/core/validation/validator';
import { Injectable } from '@nestjs/common';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';

@Injectable()
export class UploadSingleFileValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            name: Joi.string().required().max(250).pattern(/^.+\.[a-z0-9]{3,}$/i).messages({
                'string.pattern.base': 'Invalid file type',
            }),
        });
    }
}