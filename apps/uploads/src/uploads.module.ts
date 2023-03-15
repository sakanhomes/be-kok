import { Upload } from '@app/common/uploads/models/upload.model';
import { UploadPart } from '@app/common/uploads/models/upload-part.model';
import { PlainJwtStrategy } from '@app/core/auth/strategies/plain-jwt.strategy';
import { CoreModule } from '@app/core/core.module';
import LoggingModule from '@app/core/logging/logging.module';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsController } from './uploads.controller';
import * as path from 'path';
import { UploadSingleFileAction } from './actions/upload-single-file.action';
import { storeUploadsToDisk } from './middleware/store-uploads-to-disk.middleware';
import { CreateMultipartUploadAction } from './actions/create-multipart-upload.action';
import { UploadPartAction } from './actions/upload-part.action';
import { GetUploadPartsAction } from './actions/get-upload-parts.action';
import { AbortMultipartUploadAction } from './actions/abort-multipart-upload.action';
import { CompleteMultipartUploadAction } from './actions/complete-multipart-upload.action';
import { RemoveAbandonedUploadsJob } from './jobs/remove-abandoned-uploads.job';

@Module({
    imports: [
        CoreModule.forRoot(),
        TypeOrmModule.forFeature([Upload, UploadPart]),
    ],
    providers: [
        PlainJwtStrategy,
        LoggingModule.channel('uploads'),
        UploadSingleFileAction,
        GetUploadPartsAction,
        CreateMultipartUploadAction,
        UploadPartAction,
        CompleteMultipartUploadAction,
        AbortMultipartUploadAction,
        RemoveAbandonedUploadsJob,
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
