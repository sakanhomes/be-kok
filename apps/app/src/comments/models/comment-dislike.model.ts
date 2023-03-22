import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('comment_dislikes')
export class CommentDislike {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    commentId: string;

    @Column()
    userId: string;

    @CreateDateColumn()
    dislikedAt: Date;
}