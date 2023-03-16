import { makeAwsS3FileUrl } from '@app/core/aws/helpers';
import { onlyKeys, unixtime } from '@app/core/helpers';
import { Resource } from '@app/core/http/resources/resource';
import { User } from '../../users/models/user.model';
import { BasicUserResource } from '../../users/resources/basic-user.resource';
import { Category } from '../enums/category.enum';
import { Video } from '../models/video.model';

type VideoFlags ={
    isLiked: boolean;
}

type VideoResourceOptions = {
    creator?: User;
    flags?: VideoFlags;
}

export class VideoResource extends Resource {
    public static wrap = 'video';

    public constructor(
        private readonly video: Video,
        private readonly options?: VideoResourceOptions,
    ) {
        super();
    }

    public data(): Record<string, any> {
        const resource = onlyKeys(this.video, [
            'title',
            'duration',
            'description',
            'viewsAmount',
            'likesAmount',
            'commentsAmount',
            'isPublic',
        ]);

        const user = this.options?.creator ?? this.video.user ?? null;

        Object.assign(resource, {
            id: this.video.publicId,
            category: Category[this.video.categoryId],
            previewImage: makeAwsS3FileUrl(this.video.previewImageBucket, this.video.previewImageFile),
            video: makeAwsS3FileUrl(this.video.videoBucket, this.video.videoFile),
            createdAt: unixtime(this.video.createdAt),
            user: user ? new BasicUserResource(user).data() : undefined,
            flags: this.options?.flags ? onlyKeys(this.options.flags, ['isLiked']) : undefined,
        });

        return resource;
    }
}