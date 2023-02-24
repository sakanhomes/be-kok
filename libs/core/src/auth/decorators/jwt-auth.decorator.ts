import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../guards/jwt.guard';

export function JwtAuth() {
    return UseGuards(JwtGuard);
}