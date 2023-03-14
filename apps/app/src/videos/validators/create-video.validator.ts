import { Validator } from '@app/core/validation/validator';
import { Injectable } from '@nestjs/common';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';
import { Category } from '../enums/category.enum';
import { enumKeys } from '@app/core/helpers';

@Injectable()
export class CreateVideoValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            title: Joi.string().min(3).max(50).required(),
            description: Joi.string().min(3).max(500).required(),
            category: Joi.string().allow(...enumKeys(Category)).required(),
            isPublic: Joi.boolean().required(),
            videoUploadId: Joi.string().required(),
            previewUploadId: Joi.string().required(),
        });
    }
}