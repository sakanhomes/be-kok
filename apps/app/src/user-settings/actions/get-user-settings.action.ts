import { keyBy } from '@app/core/helpers';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { USER_SETTINGS_CONFIG } from '../constants';
import { UserSetting } from '../models/user-setting.model';
import { SettingCaster } from '../setting-caster';
import { SettingConfig, Settings } from '../types';

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
                settings[key] = SettingCaster.to(config.type, models[key].value);
            } else {
                settings[key] = config.default;
            }
        }

        return settings;
    }
}