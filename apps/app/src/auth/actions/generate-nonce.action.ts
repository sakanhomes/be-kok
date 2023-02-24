import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomInt } from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';

@Injectable()
export class GenerateNonceAction {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
    ) {}

    public async run(user: User): Promise<string> {
        user.nonce = this.generateNonce();

        await this.users.save(user);

        return user.nonce;
    }

    private generateNonce(): string {
        return String(randomInt(1000000, 281474976810656));
    }
}