import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { GetRandomVideosAction } from './actions/get-random-videos.action';
import { GetRandomVideosValidator } from './validators/get-random-videos.validator';
import { VideoResource } from './resources/video.resource';
import { GetTrendingVideosAction } from './actions/get-trending-videos.action';
import { CommonVideosFiltersDto } from './dtos/common-videos-filters.dto';
import { CommonVideosFiltersValidator } from './validators/common-videos-filters.validator';
import { SearchVideosValidator } from './validators/search-videos.validator';
import { SearchVideosAction } from './actions/search-videos.action';

@Controller('/videos')
export class CommonController {
    public constructor(
        private readonly videoSearcher: SearchVideosAction,
        private readonly videosRandomizer: GetRandomVideosAction,
        private readonly trendingVideosGetter: GetTrendingVideosAction,
    ) {}

    @Get('/')
    @UsePipes(SearchVideosValidator)
    public async videos(@Query() { search }: {search?: string}) {
        const videos = await this.videoSearcher.run(search);

        return VideoResource.collection(videos);
    }

    @Get('/random')
    @UsePipes(GetRandomVideosValidator)
    public async random(@Query() filters: CommonVideosFiltersDto & { amount: number }) {
        const videos = await this.videosRandomizer.run(filters.amount, filters);

        return VideoResource.collection(videos);
    }

    @Get('/trending')
    @UsePipes(CommonVideosFiltersValidator)
    public async trending(@Query() filters: CommonVideosFiltersDto) {
        const videos = await this.trendingVideosGetter.run(8, filters);

        return VideoResource.collection(videos);
    }
}
