import { Validator } from '@app/core/validation/validator';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';
import { CommonRules } from '@app/common/validation/rules/common.rules';

export class ListNotificationsValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            limit: CommonRules.getResultsLimitRules(),
        });
    }
}