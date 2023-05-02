import { Inject } from '@nestjs/common';
import { getConfigToken } from '@nestjs/config';

export function Config(namespace: string) {
    return Inject(getConfigToken(namespace));
}
