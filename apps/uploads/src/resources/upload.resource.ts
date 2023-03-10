import { onlyKeys, unixtime } from '@app/core/helpers';
import { Resource } from '@app/core/http/resources/resource';
import { UploadPartStatus } from '../enums/upload-part-status.enum';
import { UploadStatus } from '../enums/upload-status.enum';
import { UploadType } from '../enums/upload-type.enum';
import { UploadPart } from '../models/upload-part.model';
import { Upload } from '../models/upload.model';

export class UploadResource extends Resource {
    public static wrap = 'upload';

    public constructor(private readonly upload: Upload, private readonly parts: UploadPart[] = []) {
        super();
    }

    public data(): Record<string, any> {
        const resource = onlyKeys(this.upload, [
            'owner',
            'filename',
            'chunkSize',
        ]);

        Object.assign(resource, {
            id: this.upload.publicId,
            type: UploadType[this.upload.type],
            status: UploadStatus[this.upload.status],
            createdAt: unixtime(this.upload.createdAt.getTime()),
            updatedAt: unixtime(this.upload.updatedAt.getTime()),
            lastChunkAt: this.upload.lastChunkAt ? unixtime(this.upload.lastChunkAt.getTime()) : null,
            parts: this.upload.type === UploadType.multipart ? this.prepareParts(this.parts) : null,
        });

        return resource;
    }

    private prepareParts(parts: UploadPart[]) {
        const map = {};

        for (const part of parts) {
            map[part.part] = UploadPartStatus[part.status];
        }

        return map;
    }
}