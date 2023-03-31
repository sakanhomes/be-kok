import { Upload } from '@app/common/uploads/models/upload.model';
import { AwsS3Service } from '@app/core/aws/aws-s3.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadStatus } from '@app/common/uploads/enums/upload-status.enum';
import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { UploadType } from '@app/common/uploads/enums/upload-type.enum';

@Injectable()
export class AbortSingleUploadAction {

    public constructor(
        @InjectRepository(Upload)
        private readonly uploads: Repository<Upload>,
        private readonly aws: AwsS3Service,
    ) {}

    public async run(upload: Upload): Promise<void> {
        this.ensureUploadIsSingle(upload);
        this.ensureUploadIsFinished(upload);

        await this.aws.delete({
            Bucket: upload.bucket,
            Key: upload.file,
        });
        await this.uploads.remove(upload);
    }

    private ensureUploadIsFinished(upload: Upload): void {
        if (upload.status !== UploadStatus.completed) {
            throw new UnprocessableException('Upload is not finished');
        }
    }

    private ensureUploadIsSingle(upload: Upload): void {
        if (upload.type !== UploadType.single) {
            throw new UnprocessableException('Upload must be of type "single"');
        }
    }
}