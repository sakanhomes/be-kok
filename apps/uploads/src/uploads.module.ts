import { PlainJwtStrategy } from '@app/core/auth/strategies/plain-jwt.strategy';
import { AwsS3Service } from '@app/core/aws/aws-s3.service';
import { CoreModule } from '@app/core/core.module';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Upload } from './models/upload.model';

@Module({
    imports: [
        CoreModule.forRoot(),
        TypeOrmModule.forFeature([Upload]),
    ],
    providers: [
        PlainJwtStrategy,
        {
            provide: AwsS3Service,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => new AwsS3Service(
                config.get('services.aws-s3.region'),
                config.get('services.aws-s3.key'),
                config.get('services.aws-s3.secret'),
            ),
        },
    ],
})
export class UploadsModule {}
