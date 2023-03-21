import { ObjectSchema } from 'joi';
import * as Joi from 'joi';
import { CommonVideosFiltersValidator } from './common-videos-filters.validator';

export class GetRandomVideosValidator extends CommonVideosFiltersValidator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            amount: Joi.number().required().min(1).max(25),
            category: this.getCategoryRules(),
        });
    }
}