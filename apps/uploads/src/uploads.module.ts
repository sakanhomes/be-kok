import { PlainJwtStrategy } from '@app/core/auth/strategies/plain-jwt.strategy';
import { AwsS3Service } from '@app/core/aws/aws-s3.service';
import { LocalAwsS3Service } from '@app/core/aws/local-s3.service';
import { CoreModule } from '@app/core/core.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { text } from 'body-parser';
import { Upload } from './models/upload.model';
import { UploadsController } from './uploads.controller';
import * as path from 'path';

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
    ],
    controllers: [UploadsController],
})
export class UploadsModule implements NestModule {
    public constructor(private readonly config: ConfigService) {}

    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(text({
            limit: this.config.get('uploads.singleUploadMaxSize'),
            type: () => true,
        })).forRoutes('/uploads/single');

        consumer.apply(text({
            limit: this.config.get('uploads.multipartUploadMaxSize'),
            type: () => true,
        })).exclude('/uploads/single')
            .forRoutes('/uploads/*');
    }
}
