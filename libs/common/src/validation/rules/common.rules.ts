import * as Joi from 'joi';

export class CommonRules {
    public static getSearchRules(required = false): Joi.StringSchema {
        const rules = Joi.string().trim().min(3).max(42);

        return this.requiredIf(rules, required);
    }

    public static getResultsLimitRules(required = false): Joi.NumberSchema {
        const rules = Joi.number().min(1).max(25);

        return this.requiredIf(rules, required);
    }

    private static requiredIf<T extends Joi.AnySchema>(rules: T, required: boolean): T {
        return required ? rules.required() : rules.optional();
    }
}