import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../common/models/user.model";

@Entity('refresh_tokens')
export class RefreshToken {
    @PrimaryColumn()
    id: string

    @Column()
    userId: string;

    @Column()
    token: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    usedAt: Date | null = null;

    @ManyToOne(() => User)
    user: User;
}