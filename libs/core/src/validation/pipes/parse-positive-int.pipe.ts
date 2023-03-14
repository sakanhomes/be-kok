import { ArgumentMetadata, ParseIntPipe, ParseIntPipeOptions } from '@nestjs/common';

type ParsePositiveIntPipeOptions = ParseIntPipeOptions & {
    allowZero?: boolean;
}

export class ParsePositiveIntPipe extends ParseIntPipe {
    private readonly allowZero: boolean;

    public constructor(options: ParsePositiveIntPipeOptions) {
        super(options);

        this.allowZero = options.allowZero ?? false;
    }

    public async transform(value: string, metadata: ArgumentMetadata): Promise<number> {
        const int = await super.transform(value, metadata);

        if (int > 0 || (this.allowZero && int === 0)) {
            return int;
        }

        throw this.exceptionFactory(
            this.allowZero
                ? 'Validation failed (positive number or zero is expected)'
                : 'Validation failed (positive number is expected)',
        );
    }
}