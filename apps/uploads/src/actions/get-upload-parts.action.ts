import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadPart } from '../models/upload-part.model';
import { Upload } from '../models/upload.model';

@Injectable()
export class GetUploadPartsAction {
    public constructor(
        @InjectRepository(UploadPart)
        private readonly parts: Repository<UploadPart>,
    ) {}

    public run(upload: Upload): Promise<UploadPart[]> {
        return this.parts.find({
            where: {
                uploadId: upload.id,
            },
            order: {
                part: 'asc',
            },
        });
    }
}