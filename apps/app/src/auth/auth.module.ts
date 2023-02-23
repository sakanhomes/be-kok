import { Module } from '@nestjs/common';
import { CreateJwtAction } from './actions/create-jwt.action';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import * as jwt from 'jsonwebtoken';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './models/refresh-token.model';

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const signOptions: jwt.SignOptions = {};
                const expiration = config.get('auth.expiration.access');

                if (expiration) {
                    signOptions.expiresIn = expiration;
                }

                return {
                    secret: config.get('auth.jwtSecret'),
                    signOptions,
                };
            },
        }),
        TypeOrmModule.forFeature([RefreshToken]),
    ],
    providers: [CreateJwtAction],
    controllers: [AuthController],
})
export class AuthModule {}
