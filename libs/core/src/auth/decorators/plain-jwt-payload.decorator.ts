import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserModel } from 'apps/app/src/users/models/user.model';

export const PlainJwtPayload = createParamDecorator(
    (property: string | null = null, ctx: ExecutionContext): UserModel | null => {
        const request = ctx.switchToHttp().getRequest();

        if (!request.user) {
            return null;
        }

        return property ? request.user[property] : request.user;
    },
);