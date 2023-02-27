import { startsWith } from '@app/core/helpers';
import * as Joi from 'joi';

export class Crypto {
    public static address(): Joi.StringSchema {
        return Joi.string().length(42).required().custom(Crypto.isHex());
    }

    public static isHex(): Joi.CustomValidator {
        return (value: string, helper) => {
            if (startsWith(value, '0x')) {
                return value;
            }

            return helper.message({
                custom: "Value must be a hexadecimal string prefixed with '0x'",
            });
        };
    }
}
