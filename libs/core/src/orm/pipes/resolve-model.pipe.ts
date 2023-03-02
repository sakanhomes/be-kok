import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { EntityManager } from 'typeorm';

type ModelResolvingOptions = {
    value: string | number,
    modelKey?: string;
};

export class ResolveModelUsing implements PipeTransform {
    public constructor(private readonly modelKey: string) {}

    public transform(value: string) {
        return {
            value,
            modelKey: this.modelKey,
        };
    }
}

@Injectable()
export class ResolveModelPipe implements PipeTransform {
    public constructor(private readonly manager: EntityManager) {}

    public async transform(value: object | string | number, metadata: ArgumentMetadata) {
        const options = this.makeOptions(value, metadata);

        const model = await this.manager.createQueryBuilder(metadata.metatype, 'model')
            .where({
                [options.modelKey]: options.value,
            })
            .getOneOrFail();

        return model;
    }

    private makeOptions(value: object | string | number, metadata: ArgumentMetadata): ModelResolvingOptions {
        if (typeof value === 'object') {
            return value as ModelResolvingOptions;
        }

        return {
            value,
            modelKey: metadata.data,
        };
    }
}