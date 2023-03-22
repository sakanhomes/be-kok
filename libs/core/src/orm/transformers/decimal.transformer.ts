import Decimal from 'decimal.js';
import { ValueTransformer } from 'typeorm';

export const decimal: ValueTransformer = {
    from(value?: string): Decimal {
        return new Decimal(value ?? 0);
    },
    to(value?: Decimal) {
        return value ? value.toString() : '0';
    },
};