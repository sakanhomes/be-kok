import { PlainJwtStrategy } from '@app/core/auth/strategies/plain-jwt.strategy';
import { AwsS3Service } from '@app/core/aws/aws-s3.service';
import { LocalAwsS3Service } from '@app/core/aws/local-s3.service';
import { CoreModule } from '@app/core/core.module';
import LoggingModule from '@app/core/logging/logging.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VIDEO_BUCKET } from './constants';
import { Upload } from './models/upload.model';
import { UploadsController } from './uploads.controller';
import * as path from 'path';
import { UploadSingleFileAction } from './actions/upload-single-file.action';
import { storeUploadsToDisk } from './middleware/store-uploads-to-disk.middleware';

@Module({
    imports: [
        CoreModule.forRoot(),
        TypeOrmModule.forFeature([Upload]),
    ],
    providers: [
        PlainJwtStrategy,
        {
            provide: AwsS3Service,
            // inject: [ConfigService],
            // useFactory: (config: ConfigService) => new AwsS3Service(
            //     config.get('services.aws-s3.region'),
            //     config.get('services.aws-s3.key'),
            //     config.get('services.aws-s3.secret'),
            // ),
            useValue: new LocalAwsS3Service(
                path.join(process.cwd(), 'storage/aws-local'),
            ),
        },
        {
            provide: VIDEO_BUCKET,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => config.get('uploads.awsBucket'),
        },
        LoggingModule.channel('uploads'),
        UploadSingleFileAction,
    ],
    controllers: [UploadsController],
})
export class UploadsModule implements NestModule {
    public constructor(private readonly config: ConfigService) {}

    public configure(consumer: MiddlewareConsumer) {
        const uploadsDir = path.join(process.cwd(), '/storage/uploads');

        consumer.apply(storeUploadsToDisk({
            limit: this.config.get('uploads.singleUploadMaxSize'),
            dir: uploadsDir,
        })).forRoutes('/uploads/single');

        consumer.apply(storeUploadsToDisk({
            limit: this.config.get('uploads.multipartUploadMaxSize'),
            dir: uploadsDir,
        })).exclude('/uploads/single')
            .forRoutes('/uploads/*');
    }
}
