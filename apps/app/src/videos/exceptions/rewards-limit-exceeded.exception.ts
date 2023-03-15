import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { Video } from '../models/video.model';

export class RewardsLimitExceededException extends UnprocessableException {
    public constructor(video: Video) {
        super(`Rewards limit exceeded for video [${video.id}]`);
    }
}