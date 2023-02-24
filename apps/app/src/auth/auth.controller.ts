import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { __ } from '@app/core/helpers';
import { Cookie } from '@app/core/http/decorators/cookie.decorator';
import { Response } from '@app/core/http/response';
import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../common/models/user.model';
import { CreateJwtAction } from './actions/create-jwt.action';
import { CreateRefreshTokenAction } from './actions/create-refresh-token.action';
import { GenerateNonceAction } from './actions/generate-nonce.action';
import { InvalidateRefreshTokensAction } from './actions/invalidate-refresh-token.action';
import { RegisterUserAction } from './actions/register-user.action';
import { RotateRefreshTokenAction } from './actions/rotate-refresh-token.action';
import { ValidateNonceAction } from './actions/validate-nonce.action';
import { AuthCookiesHelper, REFRESH_TOKEN_COOKIE } from './auth-cookies.helper';
import { GetNonceDto } from './dtos/get-nonce.dto';
import { LoginDto } from './dtos/login.dto';
import { GetNonceValidator } from './validators/get-nonce.validator';
import { LoginValidator } from './validators/login.validator';

@Controller('/auth')
export class AuthController {
    public constructor(
        private readonly cookies: AuthCookiesHelper,
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private readonly userRegistrar: RegisterUserAction,
        private readonly nonceGenerator: GenerateNonceAction,
        private readonly nonceValidator: ValidateNonceAction,
        private readonly jwtCreator: CreateJwtAction,
        private readonly refreshTokenCreator: CreateRefreshTokenAction,
        private readonly refreshTokenRotator: RotateRefreshTokenAction,
        private readonly refreshTokenInvalidator: InvalidateRefreshTokensAction,
    ) {}

    @Post('/nonce')
    @HttpCode(200)
    @UsePipes(GetNonceValidator)
    public async nonce(@Body() data: GetNonceDto) {
        const user = await this.userRegistrar.run(data.address);

        await this.nonceGenerator.run(user);

        return {
            nonce: user.nonce,
        };
    }

    @Post('/login')
    @HttpCode(200)
    @UsePipes(LoginValidator)
    public async login(@Body() data: LoginDto) {
        const user = await this.getUserOrFail(data.address);

        await this.nonceValidator.run(user, data.signature);
        await this.nonceGenerator.run(user);

        const jwt = await this.jwtCreator.run(user.address);
        const refresh = await this.refreshTokenCreator.run(user);

        return this.cookies.set(new Response(), jwt, refresh);
    }

    @Post('/refresh')
    @HttpCode(200)
    public async refresh(@Cookie(REFRESH_TOKEN_COOKIE) token: string | null) {
        if (!token) {
            throw new UnprocessableException(__('errors.invalid-refresh-token'));
        }

        const newToken = await this.refreshTokenRotator.run(token);
        const user = await this.users.findOneBy({
            id: newToken.userId,
        });
        const jwt = await this.jwtCreator.run(user.address);

        return this.cookies.set(new Response(), jwt, newToken);
    }

    @Post('/logout')
    @HttpCode(200)
    public logout(@Cookie(REFRESH_TOKEN_COOKIE) token: string | null) {
        if (token) {
            this.refreshTokenInvalidator.run(token);
        }

        return this.cookies.remove(new Response());
    }

    private async getUserOrFail(address: string): Promise<User> {
        const user = await this.users.findOneBy({ address });

        if (!user) {
            throw new UnprocessableException(__('errors.invalid-address'));
        }

        return user;
    }

}
