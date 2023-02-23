import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../models/refresh-token.model';

@Injectable()
export class InvalidateRefreshTokensAction {
    public constructor(
        @InjectRepository(RefreshToken)
        private readonly tokens: Repository<RefreshToken>,
    ) {}

    public async run(token: string): Promise<void> {
        await this.tokens.createQueryBuilder()
            .update()
            .set({
                usedAt: new Date,
            })
            .where({ token })
            .execute();
    }
}