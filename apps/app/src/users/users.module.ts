import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/models/account.model';
import { UpdateUserAction } from './actions/update-user.action';
import { User } from './models/user.model';
import { ProfileController } from './profile.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User, Account])],
    providers: [UpdateUserAction],
    controllers: [ProfileController],
})
export class UsersModule {}
