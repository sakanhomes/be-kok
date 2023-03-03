import { keyBy } from '@app/core/helpers';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { USER_SETTINGS_CONFIG } from '../constants';
import { UserSetting } from '../models/user-setting.model';
import { User } from '../models/user.model';
import { PlainSettingValue, SettingConfig, Settings, SettingType, SettingValue } from '../types';

@Injectable()
export class GetUserSettingsAction {
    public constructor(
        @InjectRepository(UserSetting)
        private readonly settings: Repository<UserSetting>,
        @Inject(USER_SETTINGS_CONFIG)
        private readonly config: Record<string, SettingConfig>,
    ) {}

    public async run(user: User): Promise<Settings> {
        const models = await this.settings.createQueryBuilder()
            .relation(User, 'settings')
            .of(user)
            .loadMany()
            .then((settings: UserSetting[]) => keyBy(settings, 'key'));
        const settings: Settings = {};

        for (const [key, config] of Object.entries(this.config)) {
            if (models[key]) {
                settings[key] = this.castTo(config.type, models[key].value);
            } else {
                settings[key] = config.default;
            }
        }

        return settings;
    }

    private castTo(type: SettingType, value: PlainSettingValue): SettingValue {
        if (value === null) {
            return value;
        } else if (type === 'number') {
            return Number(value);
        } else if (type === 'boolean') {
            const number = Number(value);

            return isNaN(number) ? false : Boolean(number);
        } else if (type === 'object') {
            return JSON.parse(value);
        } else {
            throw new Error(`Unsupported type [${type}]`);
        }
    }
}