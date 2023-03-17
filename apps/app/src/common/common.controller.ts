import { Controller, Get } from '@nestjs/common';
import { BasicUserResource } from '../users/resources/basic-user.resource';
import { GetLeaderboardAction } from './actions/get-leaderboard.action';

@Controller('/common')
export class CommonController {
    public constructor(private readonly leaderbordGetter: GetLeaderboardAction) {}

    @Get('/leaderboard')
    public async leaderboard() {
        const leaderboard = await this.leaderbordGetter.run();

        return {
            leaderboard: {
                month: BasicUserResource.collection(leaderboard.month).data(),
                year: BasicUserResource.collection(leaderboard.year).data(),
            },
        };
    }
}
