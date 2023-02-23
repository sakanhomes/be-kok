import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const ACCESS_TOKEN_EXPIRATION = 'ACCESS_TOKEN_EXPIRATION';

@Injectable()
export class CreateJwtAction {
    public constructor(
        private readonly jwt: JwtService,
        @Inject(ACCESS_TOKEN_EXPIRATION)
        private readonly expiration: number | null,
    ) {}

    public run(address: string): Promise<string> {
        return this.jwt.signAsync({ address }, {
            expiresIn: this.expiration,
        });
    }
}