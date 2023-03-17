import { randomString } from '@app/core/helpers';
import { LockService } from '@app/core/support/locker/lock.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { Playlist } from '../models/playlist.model';

@Injectable()
export class GetDefaultPlaylistAction {
    public constructor(
        private readonly locker: LockService,
        @InjectRepository(Playlist)
        private readonly playlists: Repository<Playlist>,
    ) {}

    public async run(user: User): Promise<Playlist> {
        const key = `playlists.creating.${user.id}.default`;

        await this.locker.get(key);

        try {
            let playlist = await this.playlists.findOneBy({
                userId: user.id,
                isDefault: true,
            });

            if (playlist) {
                return playlist;
            }

            playlist = this.playlists.create({
                publicId: randomString(16),
                userId: user.id,
                isDefault: true,
            });

            return await this.playlists.save(playlist);
        } finally {
            this.locker.release(key);
        }
    }
}