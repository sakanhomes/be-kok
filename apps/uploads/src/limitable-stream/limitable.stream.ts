import { Transform, TransformCallback, WritableOptions } from 'stream';
import { LimitExceededException } from './limit-exceeded.exception';

export type Options = WritableOptions & {
    limit: number,
}

export class LimitableStream extends Transform {
    private readonly limit: number;
    private size = 0;

    public constructor(options: Options) {
        super(options);

        this.limit = options.limit;
    }

    _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
        if (!chunk) {
            callback(null, chunk);

            return;
        }

        this.size += chunk.length;

        if (this.size <= this.limit) {
            callback(null, chunk);
        } else {
            callback(new LimitExceededException(this.limit, this.size), chunk);
        }
    }
}