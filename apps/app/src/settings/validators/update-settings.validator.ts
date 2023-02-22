import { Validator } from '@app/core/validation/validator';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { ObjectSchema } from 'joi';

@Injectable()
export class UpdateSettingsValidator extends Validator {
    private settings: string[];

    public constructor(config: ConfigService) {
        super();

        this.settings = config.get('settings.settings');
    }

    protected schema(): ObjectSchema<any> {
        return Joi.object({
            key: Joi.string().allow(...this.settings).required(),
            value: Joi.string().min(10).required(),
            password: Joi.string().required(),
        });
    }
}
