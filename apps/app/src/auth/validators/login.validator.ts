import { Validator } from '@app/core/validation/validator';
import { Injectable } from '@nestjs/common';
import { ObjectSchema } from 'joi';
import * as Joi from 'joi';
import { Crypto } from '@app/core/validation/helpers/crypto.helper';

@Injectable()
export class LoginValidator extends Validator {
    protected schema(): ObjectSchema<any> {
        return Joi.object({
            address: Crypto.address(),
            signature: Joi.string().trim().length(132).required().custom(Crypto.isHex()),
        });
    }
}
