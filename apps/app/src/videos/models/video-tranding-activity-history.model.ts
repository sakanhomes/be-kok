import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('video_tranding_activity_history')
export class VideoTrandingActivityHistory {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    videoId: string;

    @Column()
    userId: string | null;

    @CreateDateColumn()
    createdAt: Date;
}