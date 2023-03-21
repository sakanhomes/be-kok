import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('video_trending_activity_history')
export class VideoTrendingActivityHistory {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    videoId: string;

    @Column()
    userId: string | null;

    @CreateDateColumn()
    createdAt: Date;
}