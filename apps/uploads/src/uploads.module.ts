import { PlainJwtStrategy } from '@app/core/auth/strategies/plain-jwt.strategy';
import { AwsS3Service } from '@app/core/aws/aws-s3.service';
import { LocalAwsS3Service } from '@app/core/aws/local-s3.service';
import { CoreModule } from '@app/core/core.module';
import LoggingModule from '@app/core/logging/logging.module';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UPLOADS_CONFIG, VIDEO_BUCKET } from './constants';
import { Upload } from './models/upload.model';
import { UploadsController } from './uploads.controller';
import * as path from 'path';
import { UploadSingleFileAction } from './actions/upload-single-file.action';
import { storeUploadsToDisk } from './middleware/store-uploads-to-disk.middleware';
import { CreateMultipartUploadAction } from './actions/create-multipart-upload.action';
import { UploadPartAction } from './actions/upload-part.action';
import { UploadPart } from './models/upload-part.model';
import { GetUploadPartsAction } from './actions/get-upload-parts.action';
import { AbortMultipartUploadAction } from './actions/abort-multipart-upload.action';
import { CompleteMultipartUploadAction } from './actions/complete-multipart-upload.action';

@Module({
    imports: [
        CoreModule.forRoot(),
        TypeOrmModule.forFeature([Upload, UploadPart]),
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
            provide: UPLOADS_CONFIG,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => config.get('uploads'),
        },
        {
            provide: VIDEO_BUCKET,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => config.get('uploads.awsBucket'),
        },
        LoggingModule.channel('uploads'),
        UploadSingleFileAction,
        GetUploadPartsAction,
        CreateMultipartUploadAction,
        UploadPartAction,
        CompleteMultipartUploadAction,
        AbortMultipartUploadAction,
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
        })).exclude(
            '/uploads/single',
            '/uploads/*/complete',
            '/uploads/*/abort',
        ).forRoutes({ path: '/uploads/*', method: RequestMethod.POST });
    }
}
