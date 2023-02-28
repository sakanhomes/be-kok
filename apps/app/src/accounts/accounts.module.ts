import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountTransaction } from './models/account-transaction.model';
import { Account } from './models/account.model';

@Module({
    imports: [TypeOrmModule.forFeature([Account, AccountTransaction])],
})
export class AccountsModule {}
