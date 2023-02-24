import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { JwtAuth } from '@app/core/auth/decorators/jwt-auth.decorator';
import { onlyKeys } from '@app/core/helpers';
import { Controller, Get } from '@nestjs/common';
import { User } from './models/user.model';

@Controller('/me')
@JwtAuth()
export class ProfileController {
    @Get('/')
    public user(@CurrentUser() user: User) {
        return this.userResponse(user);
    }

    private userResponse(user: User) {
        return onlyKeys(user, ['address', 'name', 'profileImage', 'backgroundImage', 'description']);
    }
}
