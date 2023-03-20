import { Injectable } from '@nestjs/common';
import { sleep } from '../../helpers';
import { LockingException } from './locking.exception';

@Injectable()
export class LockService {
    private readonly entries: Set<string>;

    public constructor() {
        this.entries = new Set<string>();
    }

    public async get(key: string, attempts = 5): Promise<void> {
        for (let iterations = 0; iterations < attempts; iterations++) {
            if (this.entries.has(key)) {
                await sleep(500);

                continue;
            }

            this.entries.add(key);

            return;
        }

        throw new LockingException(`Unable to get lock for key [${key}]`);
    }

    public release(key: string): void {
        this.entries.delete(key);
    }
}