import { CommonRules } from '@app/common/validation/rules/common.rules';
import { Validator } from '@app/core/validation/validator';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';

export class SearchVideosValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            search: CommonRules.getSearchRules(true, 2),
            limit: CommonRules.getResultsLimitRules(),
        });
    }
}