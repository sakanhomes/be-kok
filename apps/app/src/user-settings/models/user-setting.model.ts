import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/models/user.model';

@Entity('user_settings')
export class UserSetting {
    @PrimaryColumn()
    userId: string;

    @PrimaryColumn()
    key: string;

    @Column()
    value: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User)
    user: User;
}