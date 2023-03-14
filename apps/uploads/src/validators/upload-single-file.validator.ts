import { Validator } from '@app/core/validation/validator';
import { Injectable } from '@nestjs/common';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';
import { String } from '@app/core/validation/helpers/string.helper';

@Injectable()
export class UploadSingleFileValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            name: Joi.string().required().max(250).custom(String.filename()),
        });
    }
}