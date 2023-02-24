import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.model';
import { ProfileController } from './profile.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [ProfileController],
})
export class UsersModule {}
