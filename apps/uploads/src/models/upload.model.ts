import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UploadStatus } from '../enums/upload-status.enum';
import { UploadType } from '../enums/upload-type.enum';
import { UploadPart } from './upload-part.model';

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

    @OneToMany(() => UploadPart, 'user')
    parts: UploadPart[] | null;
}