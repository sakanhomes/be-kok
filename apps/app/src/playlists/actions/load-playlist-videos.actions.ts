import { escapeLike } from '@app/core/helpers';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { FiltersDto } from '../../users/dtos/filters.dto';
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
            query.andWhere(new Brackets(query => {
                const search = '%' + escapeLike(filters.search.toLowerCase()) + '%';

                query.where('lower(video.title) like :search', { search })
                    .orWhere('lower(video.description) like :search', { search });
            }));
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