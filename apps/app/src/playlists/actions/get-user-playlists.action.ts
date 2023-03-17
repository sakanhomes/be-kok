import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { Playlist } from '../models/playlist.model';
import { GetDefaultPlaylistAction } from './get-default-playlist.action';

export class GetUserPlaylistsAction {
    public constructor(
        @InjectRepository(Playlist)
        private readonly playlists: Repository<Playlist>,
        private readonly defaultPlaylistGetter: GetDefaultPlaylistAction,
    ) {}

    public async run(user: User): Promise<Playlist[]> {
        await this.defaultPlaylistGetter.run(user);

        return this.playlists.find({
            where: {
                userId: user.id,
            },
            order: {
                isDefault: 'asc',
                createdAt: 'asc',
            },
        });
    }
}