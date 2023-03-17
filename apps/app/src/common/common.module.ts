import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountTransaction } from '../accounts/models/account-transaction.model';
import { Account } from '../accounts/models/account.model';
import { User } from '../users/models/user.model';
import { GetLeaderboardAction } from './actions/get-leaderboard.action';
import { CommonController } from './common.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User, Account, AccountTransaction])],
    providers: [GetLeaderboardAction],
    controllers: [CommonController],
})
export class CommonModule {}
