import { Module } from '@nestjs/common';
import { ACCESS_TOKEN_EXPIRATION, CreateJwtAction } from './actions/create-jwt.action';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { APP_DOMAIN, AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../common/models/user.model';
import { RefreshToken } from './models/refresh-token.model';
import { CreateRefreshTokenAction } from './actions/create-refresh-token.action';
import { REFRESH_TOKEN_EXPIRATION, RotateRefreshTokenAction } from './actions/rotate-refresh-token.action';
import { ClearRefreshTokensJob } from './schedule/clear-refresh-tokens.job';
import { InvalidateRefreshTokensAction } from './actions/invalidate-refresh-token.action';
import { JwtStrategy } from '@app/core/auth/strategies/jwt.strategy';

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get('auth.jwtSecret'),
            }),
        }),
        TypeOrmModule.forFeature([RefreshToken, User]),
    ],
    providers: [
        JwtStrategy,
        CreateJwtAction,
        CreateRefreshTokenAction,
        RotateRefreshTokenAction,
        InvalidateRefreshTokensAction,
        ClearRefreshTokensJob,
        {
            provide: APP_DOMAIN,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => config.get('app.domain'),
        },
        {
            provide: ACCESS_TOKEN_EXPIRATION,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const expiration = config.get('auth.expiration.access');

                return expiration ? expiration : null;
            },
        },
        {
            provide: REFRESH_TOKEN_EXPIRATION,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const expiration = config.get('auth.expiration.refresh');

                return expiration ? expiration : null;
            },
        },
    ],
    controllers: [AuthController],
})
export class AuthModule {}
