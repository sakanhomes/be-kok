import { randomString } from '@app/core/helpers';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { RefreshToken } from '../models/refresh-token.model';

@Injectable()
export class CreateRefreshTokenAction {
    public constructor(
        @InjectRepository(RefreshToken)
        private readonly tokens: Repository<RefreshToken>,
    ) {}

    public async run(user: User): Promise<RefreshToken> {
        const token = this.tokens.create({
            userId: user.id,
            token: this.generateToken(),
        });

        return await this.tokens.save(token);
    }

    private generateToken(): string {
        return randomString(64);
    }
}