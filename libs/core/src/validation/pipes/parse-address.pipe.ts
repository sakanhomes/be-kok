import { PipeTransform } from '@nestjs/common';
import { Crypto } from '../helpers/crypto.helper';
import { ValidationError } from 'joi';
import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { __ } from '@app/core/helpers';

export class ParseAddressPipe implements PipeTransform {
    public async transform(value: string): Promise<string> {
        if (!await this.isAddress(value)) {
            throw new UnprocessableException(__('errors.invalid-address'));
        }

        return value.toLowerCase();
    }

    private async isAddress(value: string): Promise<boolean> {
        try {
            await Crypto.address().validateAsync(value);

            return true;
        } catch(error) {
            if (!(error instanceof ValidationError)) {
                throw error;
            }

            return false;
        }
    }
}