import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { OptionalJwtAuth } from '@app/core/auth/decorators/optional-jwt-auth.decorator';
import { onlyKeys } from '@app/core/helpers';
import { ParseAddressPipe } from '@app/core/validation/pipes/parse-address.pipe';
import { Controller, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoResource } from '../videos/resources/video.resource';
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
    @OptionalJwtAuth()
    public async videos(@CurrentUser() currentUser: User | null, @Param('address', ParseAddressPipe) address: string) {
        const user = await this.users.findOneByOrFail({ address });
        const videos = await this.videosLoader.run(user, currentUser?.id !== user.id);

        return VideoResource.collection(videos);
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
