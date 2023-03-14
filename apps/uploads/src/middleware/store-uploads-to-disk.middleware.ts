import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { randomString } from '@app/core/helpers';
import { pipeline } from 'stream/promises';
import Decimal from 'decimal.js';
import { PayloadTooLargeException } from '@app/core/exceptions/http/payload-too-large.exception';
import { LimitableStream } from '../limitable-stream/limitable.stream';
import { BadRequestException } from '@app/core/exceptions/http/bad-request.exception';

export type Options = {
    limit?: number,
    dir?: string,
}

export type Upload = {
    path: string,
    size: number;
}

export type HasUpload<T = Request> = T & {
    upload?: Upload;
}

export function storeUploadsToDisk(options: Options) {
    const middleware = new StoreUploadsToDiskMiddleware(options);

    return (request: HasUpload<Request>, response: Response, next: NextFunction) => {
        middleware.use(request, response, next);
    };
}

export class StoreUploadsToDiskMiddleware implements NestMiddleware {
    public constructor(private readonly options: Options) {
        this.setDefaulOptions();
        this.ensureUploadsDirExists();
    }

    public async use(request: HasUpload<Request>, response: Response, next: NextFunction) {
        try {
            this.ensureContentLengthDoesntExceedLimit(request);
        } catch (error) {
            return next(error);
        }

        const filepath = path.join(this.options.dir, randomString(64));
        const file = fs.createWriteStream(filepath);

        try {
            await pipeline(
                request,
                new LimitableStream({ limit: this.options.limit }),
                file,
            );
        } catch (error) {
            await fs.promises.unlink(filepath);

            return next(error);
        }

        const stat = await fs.promises.stat(filepath);

        if (!stat.size) {
            await fs.promises.unlink(filepath);

            return next();
        }

        request.upload = {
            path: filepath,
            size: stat.size,
        };

        next();
    }

    private ensureContentLengthDoesntExceedLimit(request: Request): void {
        const length = request.headers['content-length'];

        if (!length) {
            throw new BadRequestException({}, 'No "Content-Length" header found');
        }

        if ((new Decimal(length)).greaterThan(this.options.limit)) {
            throw new PayloadTooLargeException(this.options.limit);
        }
    }

    private ensureUploadsDirExists() {
        if (!fs.existsSync(this.options.dir)) {
            fs.mkdirSync(this.options.dir, {
                recursive: true,
            });
        }
    }

    private setDefaulOptions(): void {
        if (!this.options.limit) {
            this.options.limit = 2 ** 20; // 1 MiB
        }

        if (!this.options.dir) {
            this.options.dir = '/tmp/node_uploads';
        }
    }
}