import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import ConfigModule from './config/config.module';
import LoggingModule from './logging/logging.module';
import * as path from 'path';
import { TimestampsRefresher } from './orm/timestamps-refresher.handler';
import { ScheduleModule } from '@nestjs/schedule';
import { LockService } from './support/locker/lock.service';
import { AwsS3Service } from './aws/aws-s3.service';
import { LocalAwsS3Service } from './aws/local-s3.service';
import { UPLOADS_CONFIG, VIDEO_BUCKET } from 'apps/uploads/src/constants';

@Global()
@Module({})
export class CoreModule {
    public static async forRootAsync() {
        const config = await ConfigModule.forRootAsync({
            envFilePath: path.join(__dirname, '../../../.env'),
        });
        const db = CoreModule.registerDatabase();

        return {
            module: CoreModule,
            imports: [config, db, LoggingModule, ScheduleModule.forRoot()],
            providers: [ConfigService, LockService, ...this.registerAwsS3Service()],
            exports: [config, LoggingModule, LockService, AwsS3Service, UPLOADS_CONFIG, VIDEO_BUCKET],
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

    private static registerAwsS3Service() {
        return [
            {
                provide: AwsS3Service,
                inject: [ConfigService],
                useFactory: (config: ConfigService) => {
                    return config.get('uploads.enableLocalAwsStub')
                        ? new LocalAwsS3Service(path.join(process.cwd(), 'storage/aws-local'))
                        : new AwsS3Service(
                            config.get('services.aws-s3.region'),
                            config.get('services.aws-s3.key'),
                            config.get('services.aws-s3.secret'),
                        );
                },
            },
            {
                provide: UPLOADS_CONFIG,
                inject: [ConfigService],
                useFactory: (config: ConfigService) => config.get('uploads'),
            },
            {
                provide: VIDEO_BUCKET,
                inject: [ConfigService],
                useFactory: (config: ConfigService) => config.get('uploads.awsBucket'),
            },
        ];
    }
}
