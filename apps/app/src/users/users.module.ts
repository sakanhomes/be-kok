import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpdateUserAction } from './actions/update-user.action';
import { User } from './models/user.model';
import { ProfileController } from './profile.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UpdateUserAction],
    controllers: [ProfileController],
})
export class UsersModule {}
