import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { retrieveJwtFromRequest } from '../jwt-retriever';
import { UnauthorizedException } from '@app/core/exceptions/http/unauthorized.exception';

@Injectable()
export class PlainJwtStrategy extends PassportStrategy(Strategy, 'plain-jwt') {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: retrieveJwtFromRequest,
            ignoreExpiration: false,
            secretOrKey: config.get('auth.jwtSecret'),
        });
    }

    public async validate(payload: any) {
        if (!payload.address) {
            throw new UnauthorizedException();
        }

        return payload;
    }
}