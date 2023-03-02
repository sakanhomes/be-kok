import { User } from 'apps/app/src/users/models/user.model';
import { ObjectLiteral } from 'typeorm';
import { ForbiddenException } from '../exceptions/app/forbidden.exception';

export class OwnershipVerifier {
    public static verifyOrFail(user: User, model: ObjectLiteral, key = 'userId'): void {
        if (!OwnershipVerifier.verify(user, model, key)) {
            throw new ForbiddenException();
        }
    }

    public static verify(user: User, model: ObjectLiteral, key = 'userId'): boolean {
        return user.id === model[key];
    }
}