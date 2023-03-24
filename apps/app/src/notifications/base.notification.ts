/* eslint-disable @typescript-eslint/no-unused-vars */

import { __ } from '@app/core/helpers';
import { User } from '../users/models/user.model';

export abstract class BaseNotification {
    public static readonly type: string;

    public getData(user?: User): Record<string, any> | null {
        return null;
    }

    public getParams(user?: User): Record<string, any> | null {
        return null;
    }

    public static toMessage(data?: Record<string, any>, user?: User): string {
        const type = (this as any).type;

        return __(`notifications.${type}`, {
            args: data,
        });
    }
}