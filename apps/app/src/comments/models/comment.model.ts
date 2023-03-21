import { decimal } from '@app/core/orm/transformers/decimal.transformer';
import Decimal from 'decimal.js';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/models/user.model';

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    repliedCommentId: string | null;

    @Column()
    publicId: string;

    @Column()
    videoId: string;

    @Column()
    userId: string;

    @Column()
    content: string | null;

    @Column({
        type: 'bigint',
        transformer: [decimal],
    })
    likesAmount: Decimal;

    @Column({
        type: 'bigint',
        transformer: [decimal],
    })
    dislikesAmount: Decimal;

    @Column({
        type: 'bigint',
        transformer: [decimal],
    })
    repliesAmount: Decimal;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User)
    user: User;
}