import Decimal from 'decimal.js';
import { ValueTransformer } from 'typeorm';

export const decimal: ValueTransformer = {
    from(value: string): Decimal {
        return new Decimal(value);
    },
    to(value: Decimal) {
        return value.toString();
    },
};