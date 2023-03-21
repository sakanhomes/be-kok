import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('comment_likes')
export class CommentDislike {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    commentId: string;

    @Column()
    userId: string;

    @CreateDateColumn()
    likedAt: Date;
}