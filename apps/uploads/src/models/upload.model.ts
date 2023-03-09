import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UploadStatus } from '../enums/upload-status.enum';
import { UploadType } from '../enums/upload-type.enum';

@Entity('uploads')
export class Upload {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    publicId: string;

    @Column()
    owner: string;

    @Column({
        type: 'tinyint',
    })
    type: UploadType;

    @Column({
        type: 'tinyint',
    })
    status: UploadStatus;

    @Column()
    filename: string;

    @Column()
    chunkSize: number | null | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    lastChunkAt: Date | null = null;
}