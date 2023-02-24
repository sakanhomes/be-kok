import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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
}