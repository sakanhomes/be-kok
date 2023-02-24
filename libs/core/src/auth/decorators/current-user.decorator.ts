import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserModel } from 'apps/app/src/users/models/user.model';

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): UserModel | null => {
        const request = ctx.switchToHttp().getRequest();

        return request.user ?? null;
    },
);