import { ExecutionContext, Injectable, NestInterceptor, CallHandler, HttpStatus } from '@nestjs/common';
import { Response as HttpResponse } from 'express';
import { map, Observable } from 'rxjs';
import { Response } from './response';

@Injectable()
export class ResponseFormatterInterceptor implements NestInterceptor<any, any> {
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

        return json;
    }
}
