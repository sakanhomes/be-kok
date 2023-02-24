import * as Joi from 'joi';

export class Crypto {
    public static address(): Joi.StringSchema {
        return Joi.string().length(42).required().custom(Crypto.isHex());
    }
    public static isHex(): Joi.CustomValidator {
        return (value: string, helper) => {
            if (value.substring(0, 2) === '0x') {
                return value;
            }

            return helper.message({
                custom: "Value must be a hexadecimal string prefixed with '0x'",
            });
        };
    }
}
