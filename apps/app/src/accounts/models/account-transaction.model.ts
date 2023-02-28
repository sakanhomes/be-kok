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

    @Column()
    amount: string;

    @Column()
    videoId: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Account)
    user: Account;

    @ManyToOne(() => Video)
    video: Video;
}