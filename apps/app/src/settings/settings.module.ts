import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetSettingsAction } from './actions/get-settings.action';
import { UpdateSettingAction } from './actions/update-setting.action';
import { Setting } from './models/setting.model';
import { SettingsController } from './settings.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Setting])],
    controllers: [SettingsController],
    providers: [GetSettingsAction, UpdateSettingAction],
})
export class SettingsModule {}
