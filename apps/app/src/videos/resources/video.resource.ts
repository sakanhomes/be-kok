import { onlyKeys, unixtime } from '@app/core/helpers';
import { Resource } from '@app/core/http/resources/resource';
import { User } from '../../users/models/user.model';
import { Category } from '../enums/category.enum';
import { Video } from '../models/video.model';

export class VideoResource extends Resource {
    public static wrap = 'video';

    public constructor(
        private readonly video: Video,
        private readonly user: User | null = null,
    ) {
        super();
    }

    public data(): Record<string, any> {
        const resource = onlyKeys(this.video, [
            'title',
            'duration',
            'description',
            'previewImage',
            'video',
            'viewsAmount',
            'likesAmount',
            'commentsAmount',
            'isPublic',
        ]);

        const user = this.user ?? this.video.user ?? null;

        Object.assign(resource, {
            id: this.video.publicId,
            category: Category[this.video.categoryId],
            createdAt: unixtime(this.video.createdAt),
            user: user ? onlyKeys(user, ['address', 'name', 'profileImage']) : undefined,
        });

        return resource;
    }
}