import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    publicId: string;

    @Column()
    userId: string;

    @Column()
    type: string;

    @Column({
        type: 'json',
    })
    data: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    readAt: Date | null = null;
}