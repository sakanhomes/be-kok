import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { Account } from '../../accounts/models/account.model';
import { Video } from '../models/video.model';

export class ViewRewardAlreadyEnrolledException extends UnprocessableException {
    public constructor(public readonly account: Account, public readonly video: Video) {
        super(`View reward for video [${video.id}] is already enrolled to account [${account.id}]`);
    }
}