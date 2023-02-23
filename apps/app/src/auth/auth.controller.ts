import { Response } from '@app/core/responses/response';
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CookieOptions } from 'express';
import { Repository } from 'typeorm';
import { User } from '../common/models/user.model';
import { ACCESS_TOKEN_EXPIRATION, CreateJwtAction } from './actions/create-jwt.action';
import { CreateRefreshTokenAction } from './actions/create-refresh-token.action';
import { REFRESH_TOKEN_EXPIRATION } from './actions/rotate-refresh-token.action';
import { RefreshToken } from './models/refresh-token.model';

export const APP_DOMAIN = 'APP_DOMAIN';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const cookieConfig: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
};

@Controller('/auth')
export class AuthController {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private readonly jwtCreator: CreateJwtAction,
        private readonly refreshTokenCreator: CreateRefreshTokenAction,
        @Inject(APP_DOMAIN)
        private readonly domain: string | null,
        @Inject(ACCESS_TOKEN_EXPIRATION)
        private readonly accessTokenExpiration: number | null,
        @Inject(REFRESH_TOKEN_EXPIRATION)
        private readonly refreshTokenExpiration: number | null,
    ) {}

    @Get('/login')
    public async login(@Query('address') address: string) {
        const user = await this.users.findOneBy({ address });

        const jwt = await this.jwtCreator.run(address);
        const refresh = await this.refreshTokenCreator.run(user);

        return this.setAuthCookies(new Response(), jwt, refresh);
    }

    private setAuthCookies(response: Response, jwt: string, refresh: RefreshToken): Response {
        return response
            .withCookie(ACCESS_TOKEN_COOKIE, jwt, {
                ...cookieConfig,
                ...{
                    maxAge: this.accessTokenExpiration,
                    domain: this.domain ? this.domain : null,
                },
            })
            .withCookie(REFRESH_TOKEN_COOKIE, refresh.token, {
                ...cookieConfig,
                ...{
                    maxAge: this.refreshTokenExpiration,
                    domain: this.domain ? this.domain : null,
                    path: '/auth/refresh',
                },
            });
    }
}