import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookie = createParamDecorator(
    (name: string, ctx: ExecutionContext): string | null => {
        const request = ctx.switchToHttp().getRequest();

        return name ? request.cookies?.[name] : null;
    },
);