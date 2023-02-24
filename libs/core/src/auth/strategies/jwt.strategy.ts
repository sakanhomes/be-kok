import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { ACCESS_TOKEN_COOKIE } from 'apps/app/src/auth/auth-cookies.helper';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'apps/app/src/users/models/user.model';
import { UnauthorizedException } from '@app/core/exceptions/http/unauthorized.exception';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        config: ConfigService,
    ) {
        super({
            jwtFromRequest: (request: Request) => this.retrieveJwtFromRequest(request),
            ignoreExpiration: false,
            secretOrKey: config.get('auth.jwtSecret'),
        });
    }

    public async validate(payload: any) {
        const user = await this.users.findOneBy({
            address: payload.address,
        });

        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }

    private retrieveJwtFromRequest(request: Request): string | null {
        return request.cookies[ACCESS_TOKEN_COOKIE] ?? null;
    }
}