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
        const publicId = 'default';
        const key = `playlists.creating.${publicId}`;

        await this.locker.get(key);

        try {
            let playlist = await this.playlists.findOneBy({
                publicId,
                userId: user.id,
            });

            if (playlist) {
                return playlist;
            }

            playlist = this.playlists.create({
                publicId,
                userId: user.id,
            });

            return await this.playlists.save(playlist);
        } finally {
            this.locker.release(key);
        }
    }
}