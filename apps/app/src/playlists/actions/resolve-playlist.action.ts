import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from '../../users/models/user.model';
import { Playlist } from '../models/playlist.model';

export const DEFAULT_PLAYLIST_ALIAS = 'default';

@Injectable()
export class ResolvePlaylistAction {
    public constructor(
        @InjectRepository(Playlist)
        private readonly playlists: Repository<Playlist>,
    ) {}

    public run(user: User, id: string): Promise<Playlist> {
        const conditions: FindOptionsWhere<Playlist> = id === DEFAULT_PLAYLIST_ALIAS
            ? {
                userId: user.id,
                isDefault: true,
            } : {
                userId: user.id,
                publicId: id,
            };

        return this.playlists.findOneByOrFail(conditions);
    }
}