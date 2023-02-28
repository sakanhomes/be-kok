import Decimal from 'decimal.js';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/models/user.model';
import { decimal } from '@app/core/orm/transformers/decimal.transformer';

@Entity('accounts')
export class Account {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    userId: string;

    @Column({
        type: 'decimal',
        transformer: decimal,
    })
    balance: Decimal;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User)
    user: User;
}