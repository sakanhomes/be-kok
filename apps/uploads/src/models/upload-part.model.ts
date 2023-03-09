import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
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
    status: UploadPart;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => UploadPart, 'parts')
    upload: Upload;
}