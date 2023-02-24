import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';

@EventSubscriber()
export class TimestampsRefresher implements EntitySubscriberInterface {
    public beforeInsert(event: InsertEvent<any>): void | Promise<any> {
        this.refreshTimestamp(event.entity, event.metadata.createDateColumn);
        this.refreshTimestamp(event.entity, event.metadata.updateDateColumn);
    }

    public beforeUpdate(event: InsertEvent<any>): void | Promise<any> {
        this.refreshTimestamp(event.entity, event.metadata.updateDateColumn);
    }

    private refreshTimestamp(entity, column?: ColumnMetadata) {
        if (column) {
            entity[column.propertyName] = new Date();
        }
    }
}