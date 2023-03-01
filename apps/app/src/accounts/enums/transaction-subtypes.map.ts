import { TransactionSubtype } from './transaction-subtype.enum';
import { TransactionType } from './transaction-type.enum';

export const TransactionSubtypesMap = new Map([
    [TransactionType.REWARD, [
        TransactionSubtype.UPLOAD,
        TransactionSubtype.VIEW,
    ]],
]);