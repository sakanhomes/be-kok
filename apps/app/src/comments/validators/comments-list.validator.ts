import { Validator } from '@app/core/validation/validator';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';
import { enumKeys } from '@app/core/helpers';
import { CommentsSort } from '../enums/comments-sort.enum';

export class CommentsListValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            sort: Joi.string().only().allow(...enumKeys(CommentsSort)).optional(),
        });
    }
}