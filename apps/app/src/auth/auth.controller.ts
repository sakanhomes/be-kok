import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { __ } from '@app/core/helpers';
import { Cookie } from '@app/core/http/decorators/cookie.decorator';
import { Response } from '@app/core/http/response';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CookieOptions } from 'express';
import { Repository } from 'typeorm';
import { User } from '../common/models/user.model';
import { ACCESS_TOKEN_EXPIRATION, CreateJwtAction } from './actions/create-jwt.action';
import { CreateRefreshTokenAction } from './actions/create-refresh-token.action';
import { InvalidateRefreshTokensAction } from './actions/invalidate-refresh-token.action';
import { REFRESH_TOKEN_EXPIRATION, RotateRefreshTokenAction } from './actions/rotate-refresh-token.action';
import { RefreshToken } from './models/refresh-token.model';

export const APP_DOMAIN = 'APP_DOMAIN';
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

const REFRESH_TOKEN_COOKIE_PATH = '/auth';

@Controller('/auth')
export class AuthController {
    private cookieConfig: CookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    };

    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private readonly jwtCreator: CreateJwtAction,
        private readonly refreshTokenCreator: CreateRefreshTokenAction,
        private readonly refreshTokenRotator: RotateRefreshTokenAction,
        private readonly refreshTokenInvalidator: InvalidateRefreshTokensAction,
        @Inject(APP_DOMAIN)
        private readonly domain: string | null,
        @Inject(ACCESS_TOKEN_EXPIRATION)
        private readonly accessTokenExpiration: number | null,
        @Inject(REFRESH_TOKEN_EXPIRATION)
        private readonly refreshTokenExpiration: number | null,
    ) {
        this.cookieConfig.domain = this.domain ? this.domain : null;
    }

    @Post('/login')
    public async login(@Body('address') address: string) {
        const user = await this.users.findOneBy({
            address: address.toLowerCase(),
        });

        const jwt = await this.jwtCreator.run(user.address);
        const refresh = await this.refreshTokenCreator.run(user);

        return this.setAuthCookies(new Response(), jwt, refresh);
    }

    @Post('/refresh')
    public async refresh(@Cookie(REFRESH_TOKEN_COOKIE) token: string | null) {
        if (!token) {
            throw new UnprocessableException(__('errors.invalid-refresh-token'));
        }

        const newToken = await this.refreshTokenRotator.run(token);
        const user = await this.users.findOneBy({
            id: newToken.userId,
        });
        const jwt = await this.jwtCreator.run(user.address);

        return this.setAuthCookies(new Response(), jwt, newToken);
    }

    @Post('/logout')
    public logout(@Cookie(REFRESH_TOKEN_COOKIE) token: string | null) {
        if (token) {
            this.refreshTokenInvalidator.run(token);
        }

        return this.removeAuthCookies(new Response());
    }

    private setAuthCookies(response: Response, jwt: string, refresh: RefreshToken): Response {
        return response
            .withCookie(ACCESS_TOKEN_COOKIE, jwt, this.makeAccessTokenCookieOptions())
            .withCookie(REFRESH_TOKEN_COOKIE, refresh.token, this.makeRefreshTokenCookieOptions());
    }

    private removeAuthCookies(response: Response): Response {
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
            maxAge: this.accessTokenExpiration,
        };
    }

    private makeRefreshTokenCookieOptions(): CookieOptions {
        return {
            ...this.cookieConfig,
            maxAge: this.refreshTokenExpiration,
            path: REFRESH_TOKEN_COOKIE_PATH,
        };
    }
}