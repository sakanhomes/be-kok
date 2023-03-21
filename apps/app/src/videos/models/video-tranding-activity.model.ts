import { decimal } from '@app/core/orm/transformers/decimal.transformer';
import Decimal from 'decimal.js';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('video_tranding_activity')
export class VideoTrandingActivity {
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