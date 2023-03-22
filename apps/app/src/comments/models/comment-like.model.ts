import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('comment_likes')
export class CommentLike {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    commentId: string;

    @Column()
    userId: string;

    @CreateDateColumn()
    likedAt: Date;
}