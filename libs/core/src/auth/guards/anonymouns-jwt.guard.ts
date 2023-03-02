import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AnonymousJwtGuard extends AuthGuard(['jwt', 'anonymous']) {}
