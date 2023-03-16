import { UploadStatus } from '@app/common/uploads/enums/upload-status.enum';
import { Upload } from '@app/common/uploads/models/upload.model';
import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { __ } from '@app/core/helpers';
import { User } from 'apps/app/src/users/models/user.model';
import { In, Repository } from 'typeorm';

export class UploadsFinder {
    public constructor(private readonly uploads: Repository<Upload>) {}

    public async findUploadOrFail(user: User, id: string, mimetypes: string[], name?: string): Promise<Upload> {
        const upload = await this.findUpload(user, id, mimetypes);

        if (!upload) {
            const message = name
                ? __('errors.named-upload-not-found', { args: { name } })
                : __('errors.upload-not-found');

            throw new UnprocessableException(message);
        }

        return upload;

    }

    public findUpload(user: User, id: string, mimetypes: string[]): Promise<Upload | null> {
        return this.uploads.findOneBy({
            publicId: id,
            owner: user.address,
            mimetype: In(mimetypes),
            status: UploadStatus.completed,
        });
    }
}