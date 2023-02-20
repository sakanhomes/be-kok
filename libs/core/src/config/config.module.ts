import { DynamicModule } from '@nestjs/common';
import { ConfigModule as OriginalConfigModule, ConfigModuleOptions, registerAs } from '@nestjs/config';
import * as config from '../../../../config';

export default class ConfigModule {
    static async forRootAsync(options?: ConfigModuleOptions): Promise<DynamicModule> {

        const module = OriginalConfigModule.forRoot({
            ...options,
            ...{
                load: Object.entries(config).map(([namespace, resolver]) => registerAs(namespace, resolver)),
            },
        });

        await OriginalConfigModule.envVariablesLoaded;

        return module;
    }
}
