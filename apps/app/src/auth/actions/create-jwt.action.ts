import { Injectable } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CreateJwtAction {
    public constructor(private readonly jwt: JwtService) {}

    public run(address: string): Promise<string> {
        return this.jwt.signAsync({address});
    }
}