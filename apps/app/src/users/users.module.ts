import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/models/account.model';
import { Video } from '../videos/models/video.model';
import { GetUserVideos } from './actions/get-user-videos.action';
import { UpdateUserAction } from './actions/update-user.action';
import { User } from './models/user.model';
import { ProfileController } from './profile.controller';
import { UsersController } from './users.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User, Account, Video])],
    providers: [UpdateUserAction, GetUserVideos],
    controllers: [ProfileController, UsersController],
})
export class UsersModule {}
