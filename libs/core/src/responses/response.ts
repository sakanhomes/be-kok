import { HttpStatus } from '@nestjs/common';
import { plural } from 'pluralize';
import { ObjectLiteral } from 'typeorm';

interface EntityFormatter<T = ObjectLiteral> {
    (entity: T): Record<string, any>;
}

interface Class {
    new ();
}

export class Response {
    public constructor(
        public readonly data: object = {},
        public status: HttpStatus = HttpStatus.OK,
        public readonly headers: object = {},
    ) {}

    public static collection<T = ObjectLiteral>(
        entity: Class | string,
        entities: T[],
        formatter: EntityFormatter<T> | null = null,
    ): Response {
        entity = typeof entity === 'string' ? entity : entity.name;

        const key = plural(entity.toLowerCase());
        const formatted = formatter ? entities.map(formatter) : entities;

        return new Response({
            [key]: formatted,
        });
    }

    public withStatus(status: HttpStatus): Response {
        this.status = status;

        return this;
    }

    public with(data: object = {}): Response {
        Object.assign(this.data, data);

        return this;
    }
}
