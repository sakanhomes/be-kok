import { PlainJwtPayload } from '@app/core/auth/decorators/plain-jwt-payload.decorator';
import { PlainJwtGuard } from '@app/core/auth/guards/plain-jwt.guard';
import { Controller, Get, HttpCode, Post, Query, Req, UseGuards, UsePipes } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { UploadSingleFileAction } from './actions/upload-single-file.action';
import { HasUpload } from './middleware/store-uploads-to-disk.middleware';
import { Upload } from './models/upload.model';
import { UploadResource } from './resources/upload.resource';
import { UploadSingleFileValidator } from './validators/upload-single-file.validator';

@Controller('/uploads')
@UseGuards(PlainJwtGuard)
export class UploadsController {
    public constructor(
        @InjectRepository(Upload)
        private readonly uploads: Repository<Upload>,
        private readonly singleUploader: UploadSingleFileAction,
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

    @Post('/single')
    @HttpCode(200)
    @UsePipes(UploadSingleFileValidator)
    public async singleUpload(
        @Req() request: HasUpload<Request>,
        @PlainJwtPayload('address') owner: string,
        @Query() { name }: { name: string },
    ) {
        const upload = await this.singleUploader.run(owner, name, request.upload.file);

        return new UploadResource(upload);
    }
}