import { randomString, sleep } from '../helpers';
import {
    AwsS3ServiceInterface,
    CompleteUploadParams,
    MultipartUploadParams,
    ObjectIdentifier,
    ObjectParams,
    UploadPartParams,
} from './aws-s3.interface';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

export class LocalAwsS3Service implements AwsS3ServiceInterface {
    private readonly uploadsDir: string = '_uploads';
    private readonly uploadPropsFile: string = 'props.json';

    public constructor(private readonly baseDir: string, private readonly delay: number = 3000) {
        this.ensureDirExists();
    }

    public async upload(params: ObjectParams, data: Buffer): Promise<void> {
        await this.sleep();

        const filepath = this.makeFilePath(params);

        this.ensureDirExists(params.Bucket);

        await fs.promises.writeFile(path.join(this.baseDir, filepath), data, {
            flag: 'w',
        });
    }

    public async createUpload(params: ObjectParams): Promise<string> {
        await this.sleep();

        const id = randomString(64);
        const dir = path.join(params.Bucket, this.uploadsDir, id);

        this.ensureDirExists(dir);

        await fs.promises.writeFile(
            path.join(dir, this.uploadPropsFile),
            JSON.stringify({ ContentType: params.ContentType, Metadata: params.Metadata }),
            {
                flag: 'w',
            },
        );

        return id;
    }

    public async uploadPart(params: UploadPartParams, data: Buffer): Promise<string> {
        await this.sleep();

        const etag = randomUUID();
        const dir = path.join(params.Bucket, this.uploadsDir, params.UploadId);

        const propsContent = await fs.promises.readFile(path.join(dir, this.uploadPropsFile));
        const props = JSON.parse(propsContent.toString());

        if (!props.parts) {
            props.parts = {};
        }

        props.parts[params.PartNumber] = etag;

        await fs.promises.writeFile(path.join(dir, params.Key), data, { flag: 'a' });
        await fs.promises.writeFile(
            path.join(dir, this.uploadPropsFile),
            JSON.stringify(props),
            {
                flag: 'w',
            },
        );

        return etag;
    }

    public async completeUpload(params: CompleteUploadParams): Promise<void> {
        await this.sleep();

        const filepath = this.makeFilePath(params);
        const dir = path.join(params.Bucket, this.uploadsDir, params.UploadId);

        await fs.promises.rename(path.join(dir, params.Key), path.join(this.baseDir, filepath));
        await fs.promises.rm(dir, { recursive: true });
    }

    public async abortUpload(params: MultipartUploadParams): Promise<void> {
        await this.sleep();

        const dir = path.join(params.Bucket, this.uploadsDir, params.UploadId);

        await fs.promises.rm(dir, { recursive: true });
    }

    public async delete(params: ObjectIdentifier): Promise<void> {
        await this.sleep();

        const filepath = this.makeFilePath(params);

        if (!fs.existsSync(filepath)) {
            throw new Error(`Object [${filepath}] does not exist`);
        }

        await fs.promises.unlink(filepath);
    }

    private makeFilePath(params: ObjectIdentifier): string {
        return path.join(params.Bucket, params.Key);
    }

    private ensureDirExists(extra: string | null = null): void {
        const fullpath = extra ? path.join(this.baseDir, extra) : this.baseDir;

        if (!fs.existsSync(fullpath)) {
            fs.mkdirSync(fullpath, {
                recursive: true,
            });
        }
    }

    private async sleep(): Promise<void> {
        await sleep(this.delay);
    }
}