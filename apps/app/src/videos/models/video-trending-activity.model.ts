import { decimal } from '@app/core/orm/transformers/decimal.transformer';
import Decimal from 'decimal.js';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('video_trending_activity')
export class VideoTrendingActivity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    videoId: string;

    @Column()
    day: Date;

    @Column({
        type: 'decimal',
        transformer: [decimal],
    })
    actionsAmount: Decimal;

    @CreateDateColumn()
    createdAt: Date;
}