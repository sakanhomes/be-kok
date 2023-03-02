import { UseGuards } from '@nestjs/common';
import { AnonymousJwtGuard } from '../guards/anonymouns-jwt.guard';

export function OptionalJwtAuth() {
    return UseGuards(AnonymousJwtGuard);
}