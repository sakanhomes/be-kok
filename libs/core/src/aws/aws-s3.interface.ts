import { CompletedPart } from '@aws-sdk/client-s3';

export type ObjectIdentifier = {
    Bucket: string;
    Key: string;
}

export type ObjectParams = ObjectIdentifier & {
    ContentType: string;
    Metadata?: Record<string, string>;
}

export type UploadPartParams = ObjectParams & {
    UploadId: string;
    PartNumber: number;
}

export type MultipartUploadParams = ObjectIdentifier & {
    UploadId: string;
}

export type CompleteUploadParams = MultipartUploadParams & {
    Parts: CompletedPart[];
}

export interface AwsS3ServiceInterface {
    upload(params: ObjectParams, data: Buffer): Promise<void>;

    createUpload(params: ObjectParams): Promise<string>;

    uploadPart(params: UploadPartParams, data: Buffer): Promise<string>;

    completeUpload(params: CompleteUploadParams): Promise<void>;

    abortUpload(params: MultipartUploadParams): Promise<void>;

    delete(params: ObjectIdentifier): Promise<void>;
}