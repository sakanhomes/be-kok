import { fileExtension } from '@app/core/helpers';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadStatus } from '../enums/upload-status.enum';
import { UploadType } from '../enums/upload-type.enum';
import { Upload } from '../models/upload.model';
import { CreateMultipartUploadDto } from '../dtos/create-multipart-upload.dto';
import { UploadsHelper } from '../uploads.helper';
import { UPLOADS_CONFIG } from '../constants';
import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { Logger } from '@app/core/logging/decorators/logger.decorator';
import { AwsS3Service } from '@app/core/aws/aws-s3.service';

@Injectable()
export class CreateMultipartUploadAction {
    private readonly helper: UploadsHelper;

    public constructor(
        @InjectRepository(Upload)
        private readonly uploads: Repository<Upload>,
        @Logger('uploads')
        private readonly logger: LoggerService,
        @Inject(UPLOADS_CONFIG)
        private readonly config: Record<string, any>,
        private readonly aws: AwsS3Service,
    ) {
        this.helper = new UploadsHelper;
    }

    public async run(owner: string, data: CreateMultipartUploadDto): Promise<Upload> {
        this.ensureSizeSatisfiesMinLimit(data.size);
        this.helper.ensureFileExtensionIsSupported(data.name);

        const key = this.helper.generateUploadId();
        const extension = fileExtension(data.name);
        const upload = this.uploads.create({
            owner,
            type: UploadType.multipart,
            status: UploadStatus.created,
            filename: `${key}.${extension}`,
            size: data.size,
            chunkSize: 15 * 2 ** 20, // 15 MiB
        });

        try {
            upload.publicId = await this.aws.createUpload({
                Bucket: this.config.awsBucket,
                Key: upload.filename,
                ContentType: 'video/mp4',
                Metadata: {
                    owner: upload.owner,
                },
            });
        } catch (error) {
            this.logger.error(`Failed to create multipart upload on AWS S3: ${error?.message}`, { data, upload });
            this.logger.error(error);

            throw error;
        }

        return await this.uploads.save(upload);
    }

    private ensureSizeSatisfiesMinLimit(size: number): void {
        if (size < this.config.singleUploadMaxSize) {
            throw new UnprocessableException(
                `File size for multipart upload must be at least ${this.config.singleUploadMaxSize} bytes`,
            );
        }
    }
}