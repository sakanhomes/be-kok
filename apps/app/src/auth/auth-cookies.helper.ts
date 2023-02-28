import { Response } from '@app/core/http/response';
import { Inject, Injectable } from '@nestjs/common';
import { CookieOptions } from 'express';
import { ACCESS_TOKEN_EXPIRATION } from './actions/create-jwt.action';
import { REFRESH_TOKEN_EXPIRATION } from './actions/rotate-refresh-token.action';
import { RefreshToken } from './models/refresh-token.model';

export const APP_DOMAIN = 'APP_DOMAIN';
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

const REFRESH_TOKEN_COOKIE_PATH = '/auth';
const ONE_YEAR_EXPIRATION = 31536000;

@Injectable()
export class AuthCookiesHelper {
    private cookieConfig: CookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    };

    public constructor(
        @Inject(APP_DOMAIN)
        private readonly domain: string | null,
        @Inject(ACCESS_TOKEN_EXPIRATION)
        private readonly accessTokenExpiration: number | null,
        @Inject(REFRESH_TOKEN_EXPIRATION)
        private readonly refreshTokenExpiration: number | null,
    ) {
        this.cookieConfig.domain = this.domain ? this.domain : null;
    }

    public set(response: Response, jwt: string, refresh: RefreshToken): Response {
        return response
            .withCookie(ACCESS_TOKEN_COOKIE, jwt, this.makeAccessTokenCookieOptions())
            .withCookie(REFRESH_TOKEN_COOKIE, refresh.token, this.makeRefreshTokenCookieOptions());
    }

    public remove(response: Response): Response {
        return response
            .withCookie(ACCESS_TOKEN_COOKIE, '', {
                ...this.makeAccessTokenCookieOptions(),
                maxAge: 0,
            })
            .withCookie(REFRESH_TOKEN_COOKIE, '', {
                ...this.makeRefreshTokenCookieOptions(),
                maxAge: 0,
            });
    }

    private makeAccessTokenCookieOptions(): CookieOptions {
        return {
            ...this.cookieConfig,
            maxAge: this.accessTokenExpiration ?? ONE_YEAR_EXPIRATION,
        };
    }

    private makeRefreshTokenCookieOptions(): CookieOptions {
        return {
            ...this.cookieConfig,
            maxAge: this.refreshTokenExpiration ?? ONE_YEAR_EXPIRATION,
            path: REFRESH_TOKEN_COOKIE_PATH,
        };
    }
}