import { Validator } from '@app/core/validation/validator';
import { Injectable } from '@nestjs/common';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';

@Injectable()
export class UpdateUserValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            name: Joi.string().optional().trim().min(3).max(30),
            description: Joi.string().optional().allow(null, '').trim().max(500),
            profileImageUploadId: Joi.string().optional().trim(),
            backgroundImageUploadId: Joi.string().optional().trim(),
        });
    }
}