import { Upload } from '@app/common/uploads/models/upload.model';
import { AwsS3Service } from '@app/core/aws/aws-s3.service';
import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { __ } from '@app/core/helpers';
import { UploadsFinder } from '@app/core/support/uploads/uploads-finder';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../models/user.model';

type ImageIdentifier = {
    bucket: string,
    file: string,
}

type SetUserImageResult = {
    upload: Upload,
    oldImage: ImageIdentifier | null,
}

@Injectable()
export class UpdateUserAction {
    private readonly uploadsFinder: UploadsFinder;

    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        @InjectRepository(Upload)
        private readonly uploads: Repository<Upload>,
        private readonly aws: AwsS3Service,
    ) {
        this.uploadsFinder = new UploadsFinder(this.uploads);
    }

    public async run(user: User, data: UpdateUserDto): Promise<User> {
        this.ensureUserCanBeUpdated(user, data);
        this.prepareData(data);

        Object.assign(user, data);

        let profileImageUpdation: SetUserImageResult = null;
        let backgroundImageUpdation: SetUserImageResult = null;

        if (data.profileImageUploadId) {
            profileImageUpdation = await this.setUserImage(user, data.profileImageUploadId, 'profile');
        }

        if (data.backgroundImageUploadId) {
            backgroundImageUpdation = await this.setUserImage(user, data.backgroundImageUploadId, 'background');
        }

        await this.users.save(user);

        await this.handleImageUpdation(profileImageUpdation);
        await this.handleImageUpdation(backgroundImageUpdation);

        return user;
    }

    private async setUserImage(
        user: User,
        uploadId: string,
        type: 'profile' | 'background',
    ): Promise<SetUserImageResult> {
        const upload = await this.getImageUploadOrFail(
            user,
            uploadId,
            type === 'profile' ? 'Profile image' : 'Background image',
        );

        const bucketProperty = type + 'ImageBucket';
        const fileProperty = type + 'ImageFile';

        const oldImage = (user[bucketProperty] && user[fileProperty])
            ? { bucket: user[bucketProperty], file: user[fileProperty] }
            : null;

        user[bucketProperty] = upload.bucket;
        user[fileProperty] = upload.file;

        return { upload, oldImage };
    }

    private async handleImageUpdation(updation: SetUserImageResult | null): Promise<void> {
        if (!updation) {
            return;
        }

        await this.uploads.remove(updation.upload);

        if (!updation.oldImage) {
            return;
        }

        await this.aws.delete({
            Bucket: updation.oldImage.bucket,
            Key: updation.oldImage.file,
        });
    }

    private getImageUploadOrFail(user: User, id: string, name: string): Promise<Upload> {
        return this.uploadsFinder.findUploadOrFail(user, id, ['image/jpeg', 'image/png'], name);
    }

    private prepareData(data: UpdateUserDto) {
        if (!data.description) {
            data.description = null;
        }
    }

    private ensureUserCanBeUpdated(user: User, data: UpdateUserDto) {
        if (user.name && data.name) {
            throw new UnprocessableException(__('errors.name-already-set'));
        }
    }
}