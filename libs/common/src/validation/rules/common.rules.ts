import * as Joi from 'joi';

export class CommonRules {
    public static getSearchRules(required = false): Joi.StringSchema {
        let rules = Joi.string().trim().min(3).max(15);

        if (required) {
            rules = rules.required();
        } else {
            rules = rules.optional();
        }

        return rules;
    }
}