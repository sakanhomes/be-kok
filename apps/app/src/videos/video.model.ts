import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/models/user.model';

@Entity('videos')
export class Video {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    publicId: string;

    @Column()
    categoryId: string;

    @Column()
    userId: string;

    @Column()
    title: string;

    @Column()
    duration: string;

    @Column()
    description: string | null;

    @Column()
    previewImage: string;

    @Column()
    video: string;

    @Column()
    viewAmount: number;

    @Column()
    likesAmount: number;

    @Column()
    commentsAmount: number;

    @Column()
    isPublic: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User)
    user: User;
}