import { onlyKeys, unixtime } from '@app/core/helpers';
import { Response } from '@app/core/http/response';
import { ParseAddressPipe } from '@app/core/validation/pipes/parse-address.pipe';
import { Controller, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../videos/enums/category.enum';
import { Video } from '../videos/models/video.model';
import { GetUserVideos } from './actions/get-user-videos.action';
import { User } from './models/user.model';

@Controller('users')
export class UsersController {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private readonly videosLoader: GetUserVideos,
    ) {}

    @Get('/:address')
    public async entity(@Param('address', ParseAddressPipe) address: string) {
        const user = await this.users.findOneByOrFail({ address });

        return {
            user: this.userResponse(user),
        };
    }

    @Get('/:address/videos')
    public async videos(@Param('address', ParseAddressPipe) address: string) {
        const user = await this.users.findOneByOrFail({ address });
        const videos = await this.videosLoader.run(user);

        return Response.collection(Video, videos, this.videoResponse);
    }

    // TODO Unify with the one from VideosController
    private videoResponse(video: Video) {
        const resource = onlyKeys(video, [
            'title',
            'duration',
            'description',
            'previewImage',
            'video',
            'viewsAmount',
            'likesAmount',
            'commentsAmount',
        ]);

        Object.assign(resource, {
            id: video.publicId,
            category: Category[video.categoryId],
            createdAt: unixtime(video.createdAt),
        });

        return resource;
    }

    private userResponse(user: User) {
        return onlyKeys(user, [
            'address',
            'name',
            'profileImage',
            'backgroundImage',
            'description',
            'videosAmount',
            'followersAmount',
            'followingsAmount',
        ]);
    }
}
