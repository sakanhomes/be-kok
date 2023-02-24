import { Injectable } from '@nestjs/common';
import { User } from '../../common/models/user.model';
import {
    bufferToHex,
    ECDSASignature,
    fromRpcSig,
    hashPersonalMessage,
    publicToAddress,
    toBuffer,
    ecrecover,
} from 'ethereumjs-util';
import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { __ } from '@app/core/helpers';

@Injectable()
export class ValidateNonceAction {
    public async run(user: User, signature: string) {
        const nonceHash = this.makeNonceHashBuffer(user.nonce);
        const signatureParams = this.getSignatureParams(signature);
        const address = this.recoverAddress(nonceHash, signatureParams);

        if (address.toLowerCase() !== user.address) {
            throw new UnprocessableException(__('errors.invalid-address'));
        }
    }

    private recoverAddress(nonceHash: Buffer, signature: ECDSASignature): string {
        const publicKey = ecrecover(nonceHash, signature.v, signature.r, signature.s);

        return bufferToHex(publicToAddress(publicKey));
    }

    private getSignatureParams(signature: string): ECDSASignature {
        return fromRpcSig(signature);
    }

    private makeNonceHashBuffer(nonce: string): Buffer {
        const buffer = toBuffer(bufferToHex(Buffer.from(nonce)));

        return hashPersonalMessage(buffer);
    }
}
