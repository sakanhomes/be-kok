import { Validator } from '@app/core/validation/validator';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';
import { enumKeys } from '@app/core/helpers';
import { Category } from '../enums/category.enum';

export class CommonVideosFiltersValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            category: this.getCategoryRules(),
        });
    }

    protected getCategoryRules(): Joi.StringSchema {
        return Joi.string().only().allow(...enumKeys(Category)).optional();
    }
}