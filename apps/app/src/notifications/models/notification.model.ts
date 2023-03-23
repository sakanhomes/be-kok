import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type NotificationData = {
    data?: Record<string, any>,
    params?: Record<string, any>,
};

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
    data: NotificationData;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    readAt: Date | null = null;
}