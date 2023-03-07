import {
    AbortMultipartUploadCommand,
    CompletedPart,
    CompleteMultipartUploadCommand,
    CreateMultipartUploadCommand,
    PutObjectCommand,
    S3Client,
    UploadPartCommand,
} from '@aws-sdk/client-s3';

type ObjectParams = {
    Bucket: string;
    Key: string;
    ContentType: string;
    Metadata?: Record<string, string>;
}

type UploadPartParams = ObjectParams & {
    UploadId: string;
    PartNumber: number;
}

type MultipartUploadParams = {
    Bucket: string;
    Key: string;
    UploadId: string;
}

type CompleteUploadParams = MultipartUploadParams & {
    Parts: CompletedPart[];
}

export class AwsS3Service {
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
}