import { EntityManager, ObjectLiteral } from 'typeorm';

export type LockedCallback<T> = (manager: EntityManager, entity: T) => Promise<void>;

export class ModelLocker {
    public static using(manager: EntityManager): ModelLocker {
        return new ModelLocker(manager);
    }

    public constructor(private readonly manager: EntityManager) {}

    public lock<T = ObjectLiteral>(entity: T, callback: LockedCallback<T>, key: string | string[] = 'id'): Promise<T> {
        return this.manager.transaction(async (manager: EntityManager) => {
            const model = await manager
                .createQueryBuilder<T>(entity.constructor, 'entity')
                .select()
                .setLock('pessimistic_write')
                .where(this.makeWhereConditions(entity, key))
                .getOne();

            await callback(manager, model);

            return model;
        });
    }

    private makeWhereConditions(entity, keys: string | string[]): Record<string, any> {
        if (typeof keys === 'string') {
            keys = [keys];
        }

        if (!keys.length) {
            throw new Error('No locked model keys provided');
        }

        const conditions = {};

        for (const key of keys) {
            conditions[key] = entity[key];
        }

        return conditions;
    }
}