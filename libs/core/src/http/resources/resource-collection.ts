import { plural } from 'pluralize';
import { Response } from '../response';

export class ResourceCollection {
    public wrap: string | null = null;
    protected extra: any[];

    public constructor(
        protected readonly resource,
        protected readonly items: Array<any> = [],
        ...extra: any[]
    ) {
        this.wrap = plural(resource.wrap);
        this.extra = extra;
    }

    public data(): Record<string, any> {
        return this.items.map(item => (new this.resource(item, ...this.extra)).data());
    }

    public toResponse(): Response {
        const data = this.wrap ? {
            [this.wrap]: this.data(),
        } : this.data();

        return new Response(data);
    }
}