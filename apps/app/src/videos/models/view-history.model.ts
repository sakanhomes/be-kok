import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}