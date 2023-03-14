import {
    AbortMultipartUploadCommand,
    CompleteMultipartUploadCommand,
    CreateMultipartUploadCommand,
    DeleteObjectCommand,
    PutObjectCommand,
    S3Client,
    UploadPartCommand,
} from '@aws-sdk/client-s3';
import {
    AwsS3ServiceInterface,
    CompleteUploadParams,
    MultipartUploadParams,
    ObjectIdentifier,
    ObjectParams,
    UploadPartParams,
} from './aws-s3.interface';

export class AwsS3Service implements AwsS3ServiceInterface {
    private readonly client: S3Client;

    public constructor(region: string, accessKeyId: string, secretAccessKey: string) {
        this.client = new S3Client({
            maxAttempts: 3,
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    public async upload(params: ObjectParams, data: Buffer): Promise<void> {
        await this.client.send(new PutObjectCommand({
            ...params,
            Body: data,
        }));
    }

    public async createUpload(params: ObjectParams): Promise<string> {
        const response = await this.client.send(new CreateMultipartUploadCommand(params));

        return response.UploadId;
    }

    public async uploadPart(params: UploadPartParams, data: Buffer): Promise<string> {
        const response = await this.client.send(new UploadPartCommand({
            ...params,
            Body: data,
        }));

        return response.ETag;
    }

    public async completeUpload(params: CompleteUploadParams): Promise<void> {
        await this.client.send(new CompleteMultipartUploadCommand({
            Bucket: params.Bucket,
            Key: params.Key,
            UploadId: params.UploadId,
            MultipartUpload: {
                Parts: params.Parts,
            },
        }));
    }

    public async abortUpload(params: MultipartUploadParams): Promise<void> {
        await this.client.send(new AbortMultipartUploadCommand(params));
    }

    public async delete(params: ObjectIdentifier): Promise<void> {
        await this.client.send(new DeleteObjectCommand(params));
    }
}