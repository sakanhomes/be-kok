import { UnprocessableException } from "@app/core/exceptions/app/unprocessable.exception";
import { __ } from "@app/core/helpers";
import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, MoreThan, Repository, UpdateResult } from "typeorm";
import { RefreshToken } from "../models/refresh-token.model";
import { CreateRefreshTokenAction } from "./create-refresh-token.action";
import { subSeconds } from 'date-fns'

export const REFRESH_TOKEN_EXPIRATION = 'REFRESH_TOKEN_EXPIRATION';

@Injectable()
export class RotateRefreshTokenAction {
    public constructor(
        @InjectRepository(RefreshToken)
        private readonly tokens: Repository<RefreshToken>,
        private readonly tokenCreator: CreateRefreshTokenAction,
        @Inject(REFRESH_TOKEN_EXPIRATION)
        private readonly expiration: number | null,
    ){}

    /**
     * @throws {UnprocessableException} When token is invalid or not found
     */
    public async run(token: string): Promise<RefreshToken> {
        const oldToken = await this.getTokenOrFail(token);

        if (oldToken.usedAt) {
            await this.invalidateUserTokens(oldToken.userId);

            throw this.makeInvalidTokenException();
        }

        return this.tokens.manager.transaction<RefreshToken>(async () => {
            this.invalidateToken(oldToken);

            return await this.tokenCreator.run(oldToken.user);
        });
    }

    private invalidateToken(token: RefreshToken): Promise<RefreshToken>{
        token.usedAt = new Date;

        return this.tokens.save(token);
    }

    private invalidateUserTokens(userId: string): Promise<UpdateResult> {
        return this.tokens.createQueryBuilder()
            .update(RefreshToken)
            .set({
                usedAt: new Date,
            })
            .where({ userId })
            .andWhere({
                usedAt: IsNull(),
            })
            .execute();
    }

    private async getTokenOrFail(token: string): Promise<RefreshToken> {
        const conditions: any = { token };

        if (this.expiration) {
            conditions.createdAt = MoreThan(subSeconds(new Date, this.expiration));
        }

        const model = await this.tokens.findOne({
            where: conditions,
            relations: ['user'],
        });

        if (!model) {
            throw this.makeInvalidTokenException();
        }

        return model;
    }

    private makeInvalidTokenException(): UnprocessableException {
        return new UnprocessableException(__('errors.invalid-refresh-token'));
    }
}