import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserModel } from 'apps/app/src/common/models/user.model';

export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): UserModel | null => {
        const request = ctx.switchToHttp().getRequest();

        return request.user ?? null;
    },
);