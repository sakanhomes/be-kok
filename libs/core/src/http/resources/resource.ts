import { Response } from '../response';
import { ResouceCollection } from './resource-collection';

export abstract class Resource {
    public wrap: string | null = null;

    public static collection(items: Array<any>, ...extra: any[]) {
        return new ResouceCollection(this, items, ...extra);
    }

    public abstract data(): Record<string, any>

    public toResponse(): Response {
        const data = this.wrap ? {
            [this.wrap]: this.data(),
        } : this.data();

        return new Response(data);
    }
}