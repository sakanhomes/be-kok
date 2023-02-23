import { ExecutionContext, Injectable, NestInterceptor, CallHandler, HttpStatus } from '@nestjs/common';
import { Response as HttpResponse } from 'express';
import { map, Observable } from 'rxjs';
import { Cookie, Response } from './response';

@Injectable()
export class ResponseTransformerInterceptor implements NestInterceptor<any, any> {
    public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                return this.formatResponse(context.switchToHttp().getResponse(), data);
            }),
        );
    }

    private formatResponse(response: HttpResponse, data: Response | object | undefined) {
        if (!data) {
            data = {};
        }

        if (!(data instanceof Response)) {
            return {
                status: HttpStatus.OK,
                data,
            };
        }

        const json = {
            status: data.status,
            data: data.data,
            headers: Object.keys(data.headers).length ? data.headers : undefined,
        };

        if (data.status !== HttpStatus.OK) {
            response.status(data.status);
        }

        const cookies = Object.values(data.cookies);

        if (cookies.length) {
            this.setCookies(response, cookies);
        }

        return json;
    }

    private setCookies(response: HttpResponse, cookies: Cookie[]) {
        for (const cookie of cookies) {
            response.cookie(cookie.name, cookie.value, cookie.options);
        }
    }
}
