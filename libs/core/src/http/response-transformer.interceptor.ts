import { ExecutionContext, Injectable, NestInterceptor, CallHandler, HttpStatus } from '@nestjs/common';
import { Response as HttpResponse } from 'express';
import { map, Observable } from 'rxjs';
import { Resource } from './resources/resource';
import { ResouceCollection } from './resources/resource-collection';
import { Cookie, Response } from './response';

type Responsable = ResouceCollection | Resource | Response | object | undefined;

@Injectable()
export class ResponseTransformerInterceptor implements NestInterceptor<any, any> {
    public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => this.transformResponse(context.switchToHttp().getResponse(), data)),
        );
    }

    private transformResponse(response: HttpResponse, responable: Responsable) {
        const data = this.prepareResponse(responable);
        const cookies = Object.values(data.cookies);

        if (cookies.length) {
            this.setCookies(response, cookies);
        }

        if (data.status !== HttpStatus.OK) {
            response.status(data.status);
        }

        return {
            status: data.status,
            data: data.data,
            headers: Object.keys(data.headers).length ? data.headers : undefined,
        };
    }

    private setCookies(response: HttpResponse, cookies: Cookie[]) {
        for (const cookie of cookies) {
            response.cookie(cookie.name, cookie.value, cookie.options);
        }
    }

    private prepareResponse(responsable: Responsable): Response {
        if (responsable instanceof Response) {
            return responsable;
        } else if (responsable instanceof Resource || responsable instanceof ResouceCollection) {
            return responsable.toResponse();
        }

        if (!responsable) {
            responsable = {};
        }

        return new Response(responsable);
    }
}
