import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class PlainJwtGuard extends AuthGuard('plain-jwt') {}
