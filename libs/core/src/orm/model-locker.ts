import { EntityManager, ObjectLiteral } from 'typeorm';

type Callback<T> = (manager: EntityManager, entity: T) => Promise<void>;

export class ModelLocker {
    public constructor(private readonly manager: EntityManager) {}

    public lock<T = ObjectLiteral>(entity: T, callback: Callback<T>, key = 'id'): Promise<T> {
        return this.manager.transaction(async (manager: EntityManager) => {
            const model = await manager
                .createQueryBuilder<T>(entity.constructor, 'entity')
                .select()
                .setLock('pessimistic_write')
                .where({
                    [key]: entity[key],
                })
                .getOne();

            await callback(manager, model);

            return model;
        });
    }
}