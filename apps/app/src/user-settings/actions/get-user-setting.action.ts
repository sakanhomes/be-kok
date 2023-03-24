import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { __ } from '@app/core/helpers';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { USER_SETTINGS_CONFIG } from '../constants';
import { UserSetting } from '../models/user-setting.model';
import { User } from '../../users/models/user.model';
import { SettingCaster } from '../setting-caster';
import { SettingConfig, SettingValue } from '../types';

@Injectable()
export class GetUserSettingAction {
    public constructor(
        @InjectRepository(UserSetting)
        private readonly settings: Repository<UserSetting>,
        @Inject(USER_SETTINGS_CONFIG)
        private readonly config: Record<string, SettingConfig>,
    ) {}

    public async run(user: User, key: string): Promise<SettingValue> {
        if (!this.config[key]) {
            throw new UnprocessableException(__('errors.invalid-setting-key'));
        }

        const model = await this.settings.findOneBy({
            userId: user.id,
            key,
        });
        const config = this.config[key];

        if (model) {
            return SettingCaster.to(config.type, model.value);
        }

        return config.default;
    }
}