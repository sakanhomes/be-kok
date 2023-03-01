import { onlyKeys } from '@app/core/helpers';
import { ParseAddressPipe } from '@app/core/validation/pipes/parse-address.pipe';
import { Controller, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './models/user.model';

@Controller('users')
export class UsersController {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
    ) {}

    @Get('/:address')
    public async entity(@Param('address', ParseAddressPipe) address: string) {
        const user = await this.users.findOneByOrFail({ address });

        return {
            user: this.userResponse(user),
        };
    }

    private userResponse(user: User) {
        return onlyKeys(user, [
            'address',
            'name',
            'profileImage',
            'backgroundImage',
            'description',
            'videosAmount',
            'followersAmount',
            'followingsAmount',
        ]);
    }
}
