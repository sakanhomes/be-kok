import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ConfigModule from './config/config.module';

@Global()
@Module({})
export class CoreModule {
    public static forRoot() {
        const config = ConfigModule.forRootAsync();

        return {
            module: CoreModule,
            imports: [config],
            providers: [ConfigService],
            exports: [ConfigService],
        };
    }
}
