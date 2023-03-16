import { Upload } from '@app/common/uploads/models/upload.model';
import { PlainJwtPayload } from '@app/core/auth/decorators/plain-jwt-payload.decorator';
import { PlainJwtGuard } from '@app/core/auth/guards/plain-jwt.guard';
import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { ResolveModelPipe } from '@app/core/orm/pipes/resolve-model.pipe';
import { ParsePositiveIntPipe } from '@app/core/validation/pipes/parse-positive-int.pipe';
import { Body, Controller, Get, HttpCode, Param, Post, Query, Req, UseGuards, UsePipes } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { AbortMultipartUploadAction } from './actions/abort-multipart-upload.action';
import { CompleteMultipartUploadAction } from './actions/complete-multipart-upload.action';
import { CreateMultipartUploadAction } from './actions/create-multipart-upload.action';
import { GetUploadPartsAction } from './actions/get-upload-parts.action';
import { UploadPartAction } from './actions/upload-part.action';
import { UploadSingleFileAction } from './actions/upload-single-file.action';
import { CreateMultipartUploadDto } from './dtos/create-multipart-upload.dto';
import { HasUpload } from './middleware/store-uploads-to-disk.middleware';
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
        private readonly partsLoader: GetUploadPartsAction,
        private readonly multipartUploadCreator: CreateMultipartUploadAction,
        private readonly multipartUploader: UploadPartAction,
        private readonly multipartUploadCompleter: CompleteMultipartUploadAction,
        private readonly multipartUploadAborted: AbortMultipartUploadAction,
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
        this.ensureUploadExists(request);

        const upload = await this.singleUploader.run(owner, name, request.upload);

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

    @Get('/:publicId')
    public async getUpload(@Param('publicId', ResolveModelPipe) upload: Upload) {
        const parts = await this.partsLoader.run(upload);

        return new UploadResource(upload, parts);
    }

    @Post('/:publicId')
    @HttpCode(200)
    public async uploadPart(
        @Req() request: HasUpload<Request>,
        @Param('publicId', ResolveModelPipe) upload: Upload,
        @Query('part', new ParsePositiveIntPipe({ allowZero: true })) part: number,
    ) {
        this.ensureUploadExists(request);

        upload = await this.multipartUploader.run(upload, part, request.upload);
        const parts = await this.partsLoader.run(upload);

        return new UploadResource(upload, parts);
    }

    @Post('/:publicId/complete')
    @HttpCode(200)
    public async completeMultipartUpload(@Param('publicId', ResolveModelPipe) upload: Upload) {
        upload = await this.multipartUploadCompleter.run(upload);

        return new UploadResource(upload);
    }

    @Post('/:publicId/abort')
    @HttpCode(200)
    public async abortMultipartUpload(@Param('publicId', ResolveModelPipe) upload: Upload) {
        upload = await this.multipartUploadAborted.run(upload);

        return new UploadResource(upload);
    }

    private ensureUploadExists(request: HasUpload<Request>): void {
        if (!request.upload) {
            throw new UnprocessableException('File is not uploaded');
        }
    }
}