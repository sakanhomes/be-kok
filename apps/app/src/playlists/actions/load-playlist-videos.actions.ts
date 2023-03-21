import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { FiltersDto } from '../../users/dtos/filters.dto';
import { SearchHelper } from '../../users/helpers/search.helper';
import { Video } from '../../videos/models/video.model';
import { PlaylistVideo } from '../models/playlist-video.model';
import { Playlist } from '../models/playlist.model';

@Injectable()
export class LoadPlaylistVideosAction {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
    ) {}

    public async run(playlist: Playlist, filters?: FiltersDto): Promise<Playlist> {
        let query = this.getPlaylistVideosQuery(playlist);

        if (filters) {
            query = this.applyFilters(query, filters);
        }

        playlist.videos = await query.getMany();

        return playlist;
    }

    private applyFilters(query: SelectQueryBuilder<Video>, filters: FiltersDto): SelectQueryBuilder<Video> {
        if (filters.search) {
            SearchHelper.applyVideoSearchFilters(query, filters.search);
        }

        return query;
    }

    private getPlaylistVideosQuery(playlist: Playlist): SelectQueryBuilder<Video> {
        return this.videos.createQueryBuilder('video')
            .innerJoin(PlaylistVideo, 'pv', 'pv.videoId = video.id')
            .where('pv.playlistId = :id', { id: playlist.id })
            .orderBy('pv.addedAt', 'DESC');
    }
}