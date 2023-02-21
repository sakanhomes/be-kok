import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard as OriginalGuard } from '@nestjs/throttler';
import { TooManyRequestsException } from '../exceptions/http/too-many-requests.exception';

export class ThrottlerGuard extends OriginalGuard {
    protected async handleRequest(context: ExecutionContext, limit: number, ttl: number): Promise<boolean> {
        const { req, res } = this.getRequestResponse(context);

        if (Array.isArray(this.options.ignoreUserAgents)) {
            for (const pattern of this.options.ignoreUserAgents) {
                if (pattern.test(req.headers['user-agent'])) {
                    return true;
                }
            }
        }

        const tracker = this.getTracker(req);
        const key = this.generateKey(context, tracker);
        const { totalHits, timeToExpire } = await this.storageService.increment(key, ttl);

        res.header(`${this.headerPrefix}-Limit`, limit);
        res.header(`${this.headerPrefix}-Remaining`, Math.max(0, limit - totalHits));
        res.header(`${this.headerPrefix}-Reset`, timeToExpire);

        if (totalHits > limit) {
            res.header('Retry-After', timeToExpire);

            throw new TooManyRequestsException(timeToExpire);
        }

        return true;
    }
}
