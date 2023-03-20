import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('video_tranding_activity')
export class VideoTrandingActivity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    videoId: string;

    @Column()
    day: Date;

    @Column()
    actionsAmount: string;

    @CreateDateColumn()
    createdAt: Date;
}