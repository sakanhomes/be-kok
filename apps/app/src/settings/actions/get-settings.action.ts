import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../models/setting.model';

@Injectable()
export class GetSettingsAction {
    public constructor(
        @InjectRepository(Setting)
        private readonly settings: Repository<Setting>,
    ) {}

    public run(): Promise<Setting[]> {
        return this.settings.find();
    }
}
