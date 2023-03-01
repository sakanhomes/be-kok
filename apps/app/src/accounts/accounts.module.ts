import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountTransaction } from './models/account-transaction.model';
import { Account } from './models/account.model';
import { IncreaseBalanceAction } from './actions/increase-balance.action';
import { DecreaseBalanceAction } from './actions/decrease-balance.action';

@Module({
    imports: [TypeOrmModule.forFeature([Account, AccountTransaction])],
    providers: [IncreaseBalanceAction, DecreaseBalanceAction],
})
export class AccountsModule {}
