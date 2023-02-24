import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.model';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
})
export class UsersModule {}
