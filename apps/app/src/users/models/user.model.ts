import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Account } from '../../accounts/models/account.model';

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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Account, 'user')
    accounts: Account[];
}