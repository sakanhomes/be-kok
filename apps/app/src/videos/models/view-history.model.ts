import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Video } from './video.model';

@Entity('views_history')
export class ViewHistory {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    videoId: string;

    @Column()
    userId: string;

    @CreateDateColumn()
    viewedAt: Date;

    @ManyToOne(() => Video)
    video: Video;
}