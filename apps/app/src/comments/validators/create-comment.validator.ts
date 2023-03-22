import { Validator } from '@app/core/validation/validator';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';

export class CreateCommentValdiator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            content: Joi.string().trim().min(3).max(500).required(),
            repliedCommentId: Joi.string().trim().optional(),
        });
    }
}