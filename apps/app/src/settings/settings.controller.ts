import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { GetSettingsAction } from './actions/get-settings.action';
import { UpdateSettingAction } from './actions/update-setting.action';
import { UpdateSettingDto } from './dtos/update-setting.dto';
import { UpdateSettingsValidator } from './validators/update-settings.validator';

@Controller('/settings')
export class SettingsController {
    public constructor(private readonly retriever: GetSettingsAction, private readonly updater: UpdateSettingAction) {}

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

    @Get('/update')
    @UsePipes(UpdateSettingsValidator)
    public async update(@Query() data: UpdateSettingDto) {
        await this.updater.run(data.key, data.value, data.password);
    }
}
