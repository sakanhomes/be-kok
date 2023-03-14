import { startsWith } from '@app/core/helpers';
import * as Joi from 'joi';

export class String {
    public static startsWith(prefix: string | string[]): Joi.CustomValidator {
        return (value: string, helper) => {
            const isArray = Array.isArray(prefix);

            if (isArray) {
                for (const candidate of prefix) {
                    if (startsWith(value, candidate)) {
                        return value;
                    }
                }
            } else if (startsWith(value, prefix)) {
                return value;
            }

            return helper.message({
                custom: isArray
                    ? 'String must start with one of the allowed prefixes: ' + prefix.join(', ')
                    : `String must start with ${prefix}`,
            });
        };
    }

    public static filename(): Joi.CustomValidator {
        return (value: string, helper) => {
            if (value.match(/^.+\.[a-z0-9]{3,}$/i)) {
                return value;
            }

            return helper.message({
                custom: 'Invalid file type',
            });
        };
    }
}
