import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { keyBy, __ } from '@app/core/helpers';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { USER_SETTINGS_CONFIG } from '../constants';
import { UserSetting } from '../models/user-setting.model';
import { User } from '../../users/models/user.model';
import { SettingCaster } from '../setting-caster';
import { SettingConfig, Settings } from '../types';

@Injectable()
export class UpdateUserSettingsAction {
    public constructor(
        @InjectRepository(UserSetting)
        private readonly settings: Repository<UserSetting>,
        @Inject(USER_SETTINGS_CONFIG)
        private readonly config: Record<string, SettingConfig>,
    ) {}

    public async run(user: User, settings: Settings): Promise<void> {
        this.validateSettingKeys(settings);

        const existedModels = await this.settings.findBy({
            userId: user.id,
            key: In(Object.keys(settings)),
        }).then(settings => keyBy(settings, 'key'));
        const newModels: UserSetting[] = [];

        // eslint-disable-next-line prefer-const
        for (let [key, value] of Object.entries(settings)) {
            value = SettingCaster.from(this.config[key].type, value);

            if (existedModels[key]) {
                existedModels[key].value = value;
            } else {
                newModels.push(
                    this.settings.create({
                        userId: user.id,
                        key,
                        value,
                        createdAt: new Date,
                        updatedAt: new Date,
                    }),
                );
            }
        }

        await Promise.all([
            this.saveNewSettings(newModels),
            this.updateExistedSettings(Object.values(existedModels)),
        ]);
    }

    private async saveNewSettings(settings: UserSetting[]): Promise<void> {
        this.settings.insert(settings);
    }

    private async updateExistedSettings(settings: UserSetting[]): Promise<void> {
        const promises: Promise<any>[] = [];

        for (const setting of settings) {
            promises.push(
                this.settings.save(setting),
            );
        }

        await Promise.all(promises);
    }

    private validateSettingKeys(settings: Settings): void {
        for (const key of Object.keys(settings)) {
            if (!this.config[key]) {
                throw new UnprocessableException(__('errors.invalid-setting-key'), { key });
            }
        }
    }
}