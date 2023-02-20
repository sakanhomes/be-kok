import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import LogManager from './log.manager';

export const LOGGER = 'logger';

@Module({
    providers: [LogManager, LoggingModule.main(), LoggingModule.channel('nest')],
    exports: [LogManager, LOGGER],
})
export default class LoggingModule {
    public static main(): Provider {
        return {
            provide: LOGGER,
            inject: [ConfigService, LogManager],
            useFactory: (config: ConfigService, manager: LogManager) => {
                return manager.channel(config.get('logging.default'));
            },
        };
    }

    public static channel(name: string): Provider {
        return {
            provide: `logger.${name}`,
            inject: [LogManager],
            useFactory: (manager: LogManager) => manager.channel(name),
        };
    }
}
