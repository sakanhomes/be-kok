import { PlainJwtPayload } from '@app/core/auth/decorators/plain-jwt-payload.decorator';
import { PlainJwtGuard } from '@app/core/auth/guards/plain-jwt.guard';
import { Body, Controller, Get, HttpCode, Post, Query, Req, UseGuards, UsePipes } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { CreateMultipartUploadAction } from './actions/create-multipart-upload.action';
import { UploadSingleFileAction } from './actions/upload-single-file.action';
import { CreateMultipartUploadDto } from './dtos/create-multipart-upload.dto';
import { HasUpload } from './middleware/store-uploads-to-disk.middleware';
import { Upload } from './models/upload.model';
import { UploadResource } from './resources/upload.resource';
import { CreateMulipartUploadValidator } from './validators/create-multipart-upload.validator';
import { UploadSingleFileValidator } from './validators/upload-single-file.validator';

@Controller('/uploads')
@UseGuards(PlainJwtGuard)
export class UploadsController {
    public constructor(
        @InjectRepository(Upload)
        private readonly uploads: Repository<Upload>,
        private readonly singleUploader: UploadSingleFileAction,
        private readonly multipartUploadCreator: CreateMultipartUploadAction,
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

    @Post('/')
    @HttpCode(200)
    @UsePipes(CreateMulipartUploadValidator)
    public async createMultipartUpload(
        @PlainJwtPayload('address') owner: string,
        @Body() data: CreateMultipartUploadDto,
    ) {
        const upload = await this.multipartUploadCreator.run(owner, data);

        return new UploadResource(upload);
    }
}