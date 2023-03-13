import { Upload } from '../models/upload.model';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { UploadPartStatus } from 'apps/uploads/src/enums/upload-part-status.enum';

@Entity('upload_parts')
export class UploadPart {
    @PrimaryColumn()
    uploadId: string;

    @PrimaryColumn()
    part: number;

    @Column({
        type: 'tinyint',
    })
    status: UploadPartStatus;

    @Column()
    externalId: string | null = null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Upload, 'parts')
    upload: Upload;
}