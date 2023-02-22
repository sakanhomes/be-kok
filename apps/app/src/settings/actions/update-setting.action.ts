import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { __ } from '@app/core/helpers';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../models/setting.model';

@Injectable()
export class UpdateSettingAction {
    private password: string;
    private allowedKeys: string[];

    public constructor(
        @InjectRepository(Setting) private readonly settings: Repository<Setting>,
        config: ConfigService,
    ) {
        this.password = config.get('settings.password');
        this.allowedKeys = config.get('settings.settings');
    }

    public async run(key: string, value: string | null, password: string): Promise<void> {
        this.ensureSettingKeyIsValid(key);
        this.ensurePasswordIsValid(password);

        let setting = await this.settings.findOneBy({ key });

        if (!setting) {
            setting = this.settings.create({
                key,
                value,
            });
        }

        await this.settings.save(setting);
    }

    private ensureSettingKeyIsValid(key: string) {
        if (!this.allowedKeys.includes(key)) {
            throw new UnprocessableException(__('errors.invalid-setting-key'), { key });
        }
    }

    private ensurePasswordIsValid(password: string) {
        if (password !== this.password) {
            throw new UnprocessableException(__('errors.invalid-master-password'));
        }
    }
}
