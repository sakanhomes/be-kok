import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { UploadStatus } from '../enums/upload-status.enum';
import { UploadType } from '../enums/upload-type.enum';

@Entity('uploads')
export class Upload {
    @PrimaryColumn()
    id: string;

    @Column()
    ownerAddress: string;

    @Column({
        type: 'tinyint',
    })
    type: UploadType;

    @Column({
        type: 'tinyint',
    })
    status: UploadStatus;

    @Column()
    chunkSize: number | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    lastChunkAt: Date;
}