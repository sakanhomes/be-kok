import { ACCESS_TOKEN_COOKIE } from 'apps/app/src/auth/auth-cookies.helper';
import { Request } from 'express';

export function retrieveJwtFromRequest(request: Request): string | null {
    return request.cookies[ACCESS_TOKEN_COOKIE] ?? null;
}