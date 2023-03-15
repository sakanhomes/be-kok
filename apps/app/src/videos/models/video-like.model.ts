import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('video_likes')
export class VideoLike {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    videoId: string;

    @Column()
    userId: string;

    @CreateDateColumn()
    likedAt: Date;
}