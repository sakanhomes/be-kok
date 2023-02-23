import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import ConfigModule from './config/config.module';
import LoggingModule from './logging/logging.module';
import * as path from 'path';
import { TimestampsRefresher } from './orm/timestamps-refresher.handler';

@Global()
@Module({})
export class CoreModule {
    public static forRoot() {
        const config = ConfigModule.forRootAsync({
            envFilePath: path.join(__dirname, '../../../.env'),
        });
        const db = CoreModule.registerDatabase();

        return {
            module: CoreModule,
            imports: [config, db, LoggingModule],
            providers: [ConfigService],
            exports: [ConfigService, LoggingModule],
        };
    }

    private static registerDatabase() {
        return TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    type: 'mysql',
                    host: config.get('db.host'),
                    port: config.get('db.port'),
                    username: config.get('db.username'),
                    password: config.get('db.password'),
                    database: config.get('db.database'),
                    autoLoadEntities: true,
                    synchronize: false,
                    subscribers: [TimestampsRefresher],
                };
            },
        });
    }
}
