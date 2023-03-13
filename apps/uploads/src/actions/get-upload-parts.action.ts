import { Upload } from '@app/common/uploads/models/upload.model';
import { UploadPart } from '@app/common/uploads/models/upload-part.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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