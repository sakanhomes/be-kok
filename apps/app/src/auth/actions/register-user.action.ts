import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../common/models/user.model';

@Injectable()
export class RegisterUserAction {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
    ) {}

    public async run(address: string): Promise<User> {
        address = address.toLowerCase();

        let user = await this.users.findOneBy({ address });

        if (user) {
            return user;
        }

        user = this.users.create({ address });

        return await this.users.save(user);
    }
}