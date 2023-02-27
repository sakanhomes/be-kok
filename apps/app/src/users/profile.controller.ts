import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { JwtAuth } from '@app/core/auth/decorators/jwt-auth.decorator';
import { onlyKeys } from '@app/core/helpers';
import { Body, Controller, Get, Patch, UsePipes } from '@nestjs/common';
import { UpdateUserAction } from './actions/update-user.action';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './models/user.model';
import { UpdateUserValidator } from './validators/update-user.validator';

@Controller('/me')
@JwtAuth()
export class ProfileController {
    public constructor(private readonly updater: UpdateUserAction) {}

    @Get('/')
    public user(@CurrentUser() user: User) {
        return this.userResponse(user);
    }

    @Patch('/')
    @UsePipes(UpdateUserValidator)
    public async update(@CurrentUser() user: User, @Body() data: UpdateUserDto) {
        await this.updater.run(user, data);

        return this.userResponse(user);
    }

    private userResponse(user: User) {
        return onlyKeys(user, ['address', 'name', 'profileImage', 'backgroundImage', 'description']);
    }
}
