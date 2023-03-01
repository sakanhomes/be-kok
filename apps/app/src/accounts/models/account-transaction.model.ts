import { decimal } from '@app/core/orm/transformers/decimal.transformer';
import Decimal from 'decimal.js';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Video } from '../../videos/models/video.model';
import { TransactionSubtype } from '../enums/transaction-subtype.enum';
import { TransactionType } from '../enums/transaction-type.enum';
import { Account } from './account.model';

@Entity('account_transactions')
export class AccountTransaction {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    accountId: string;

    @Column('text')
    type: TransactionType;

    @Column('text')
    subtype: TransactionSubtype;

    @Column({
        type: 'decimal',
        transformer: decimal,
    })
    amount: Decimal;

    @Column()
    videoId: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Account)
    account: Account;

    @ManyToOne(() => Video)
    video: Video;
}