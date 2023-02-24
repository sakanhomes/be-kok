import { Logger } from '@app/core/logging/decorators/logger.decorator';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { REFRESH_TOKEN_EXPIRATION } from '../actions/rotate-refresh-token.action';
import { RefreshToken } from '../models/refresh-token.model';
import { subSeconds } from 'date-fns';

@Injectable()
export class ClearRefreshTokensJob {
    public constructor(
        @Logger()
        private readonly logger: LoggerService,
        @InjectRepository(RefreshToken)
        private readonly tokens: Repository<RefreshToken>,
        @Inject(REFRESH_TOKEN_EXPIRATION)
        private readonly expiration: number | null,
    ) {}

    @Cron('0 0 * * *')
    public async run() {
        if (!this.expiration) {
            this.logger.log('Refresh tokens expiration is not set, skipping expired tokens clearing');

            return;
        }

        const createdBefore = subSeconds(new Date, this.expiration);

        this.logger.log('Clearing expired refresh tokens', { createdBefore });

        const result = await this.tokens.createQueryBuilder()
            .delete()
            .from(RefreshToken)
            .where({
                createdAt: LessThanOrEqual(createdBefore),
            })
            .execute();

        this.logger.log(`Removed ${result.affected} expired refresh tokens`, {
            removed: result.affected,
        });
    }
}