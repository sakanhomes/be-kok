import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('playlist_videos')
export class PlaylistVideo {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    playlistId: string;

    @Column()
    videoId: string;

    @CreateDateColumn()
    addedAt: Date;
}