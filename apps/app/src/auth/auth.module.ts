import { Module } from '@nestjs/common';
import { CreateJwtAction } from './actions/create-jwt.action';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import * as jwt from 'jsonwebtoken';

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
    ],
    providers: [CreateJwtAction],
    controllers: [AuthController],
})
export class AuthModule {}
