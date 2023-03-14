import { UnprocessableException } from '@app/core/exceptions/app/unprocessable.exception';
import { __ } from '@app/core/helpers';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../models/user.model';

@Injectable()
export class UpdateUserAction {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
    ) {}

    public async run(user: User, data: UpdateUserDto): Promise<User> {
        this.ensureUserCanBeUpdated(user, data);
        this.prepareData(data);

        Object.assign(user, data);

        await this.users.save(user);

        return user;
    }

    private prepareData(data: UpdateUserDto) {
        if (!data.description) {
            data.description = null;
        }
    }

    private ensureUserCanBeUpdated(user: User, data: UpdateUserDto) {
        if (user.name && data.name) {
            throw new UnprocessableException(__('errors.name-already-set'));
        }
    }
}