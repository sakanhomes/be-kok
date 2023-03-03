import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Account } from '../../accounts/models/account.model';
import { Video } from '../../videos/models/video.model';
import { UserSetting } from './user-setting.model';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    address: string;

    @Column()
    nonce: string | null;

    @Column()
    name: string | null;

    @Column()
    profileImage: string | null;

    @Column()
    backgroundImage: string | null;

    @Column()
    description: string | null;

    @Column()
    videosAmount: number;

    @Column()
    followersAmount: number;

    @Column()
    followingsAmount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => UserSetting, 'user')
    settings: UserSetting[];

    @OneToMany(() => Account, 'user')
    accounts: Account[];

    @OneToMany(() => Video, 'user')
    videos: Video[];
}