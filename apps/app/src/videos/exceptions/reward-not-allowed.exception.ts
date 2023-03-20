import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';

export class RewardNotAllowedException extends UnprocessableException {
    public constructor() {
        super('Reward is not allowed');
    }
}