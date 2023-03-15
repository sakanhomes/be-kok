import { UploadPart } from '../models/upload-part.model';
import { UploadStatus } from '@app/common/uploads/enums/upload-status.enum';
import { UploadType } from '@app/common/uploads/enums/upload-type.enum';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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
    bucket: string;

    @Column()
    file: string;

    @Column()
    mimetype: string;

    @Column()
    size: number;

    @Column()
    chunkSize: number | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    lastChunkAt: Date | null = null;

    @OneToMany(() => UploadPart, 'upload')
    parts: UploadPart[] | null;
}