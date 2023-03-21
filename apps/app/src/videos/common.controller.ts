import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { GetRandomVideosAction } from './actions/get-random-videos.action';
import { GetRandomVideosValidator } from './validators/get-random-videos.validator';
import { VideoResource } from './resources/video.resource';
import { GetTrandingVideosAction } from './actions/get-tranding-videos.action';

@Controller('/videos')
export class CommonController {
    public constructor(
        private readonly videosRandomizer: GetRandomVideosAction,
        private readonly trandingVideosGetter: GetTrandingVideosAction,
    ) {}

    @Get('/random')
    @UsePipes(GetRandomVideosValidator)
    public async random(@Query() data: { amount: number }) {
        const videos = await this.videosRandomizer.run(data.amount);

        return VideoResource.collection(videos);
    }

    @Get('/tranding')
    public async trands() {
        const videos = await this.trandingVideosGetter.run();

        return VideoResource.collection(videos);
    }
}
