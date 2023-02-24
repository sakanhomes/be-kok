import * as Joi from 'joi';

export class Crypto {
    public static address(): Joi.StringSchema {
        return Joi.string().min(34).max(42).required();
    }
}
