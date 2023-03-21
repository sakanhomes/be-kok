import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CommonVideosFiltersDto } from '../dtos/common-videos-filters.dto';
import { Category } from '../enums/category.enum';
import { Video } from '../models/video.model';

@Injectable()
export class GetRandomVideosAction {
    public constructor(
        @InjectRepository(Video)
        private readonly videos: Repository<Video>,
    ) {}

    public run(amount: number, filters?: CommonVideosFiltersDto): Promise<Video[]> {
        const query = this.getRandomVideosQuery();

        query.limit(amount);

        if (filters) {
            this.applyFilters(query, filters);
        }

        return query.getMany();
    }

    private applyFilters(query: SelectQueryBuilder<Video>, filters: CommonVideosFiltersDto): void {
        if (filters.category) {
            query.andWhere('video.categoryId = :category', { category: Category[filters.category] });
        }
    }

    private getRandomVideosQuery(): SelectQueryBuilder<Video> {
        return this.videos
            .createQueryBuilder('video')
            .select()
            .leftJoinAndSelect('video.user', 'user')
            .orderBy('RAND()')
            .where('video.isPublic = 1');
    }
}