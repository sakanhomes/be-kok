import { PlainJwtPayload } from '@app/core/auth/decorators/plain-jwt-payload.decorator';
import { PlainJwtGuard } from '@app/core/auth/guards/plain-jwt.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from './models/upload.model';
import { UploadResource } from './resources/upload.resource';

@Controller('/uploads')
@UseGuards(PlainJwtGuard)
export class UploadsController {
    public constructor(
        @InjectRepository(Upload)
        private readonly uploads: Repository<Upload>,
    ) {}

    @Get('/')
    public async uploadsList(@PlainJwtPayload('address') owner: string) {
        const uploads = await this.uploads.find({
            where: { owner },
            order: {
                createdAt: 'desc',
            },
        });

        return UploadResource.collection(uploads);
    }

}