import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { PartStatus } from '../enums/part-status.enum';
import { Upload } from './upload.model';

@Entity('upload_parts')
export class UploadPart {
    @PrimaryColumn()
    uploadId: string;

    @PrimaryColumn()
    part: number;

    @Column({
        type: 'tinyint',
    })
    status: PartStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Upload, 'parts')
    upload: Upload;
}