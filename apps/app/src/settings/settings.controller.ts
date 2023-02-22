import { onlyKeys } from '@app/core/helpers';
import { Response } from '@app/core/responses/response';
import { Controller, Get } from '@nestjs/common';
import { GetSettingsAction } from './actions/get-settings.action';
import { Setting } from './models/setting.model';

@Controller('/settings')
export class SettingsController {
    public constructor(private readonly retriever: GetSettingsAction) {}

    @Get()
    public async list() {
        const settings = await this.retriever.run();
        const flatten = {};

        for (const setting of settings) {
            flatten[setting.key] = setting.value;
        }

        return {
            settings: flatten,
        };
    }
    }
}
