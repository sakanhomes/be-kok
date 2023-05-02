import { RewardableActivity } from 'apps/app/src/videos/enums/rewardable-activity.enum';

export type VideosConfig = {
    trends: {
        lastDaysRange: number;
    };
    rewards: {
        [K in RewardableActivity]: {
            enabled?: boolean;
            amount: number;
            limit: number | null;
        };
    };
};

export default (): VideosConfig => ({
    trends: {
        lastDaysRange: 4, // Plus current day
    },
    rewards: {
        creation: {
            amount: 10,
            limit: 3,
        },
        view: {
            amount: 1,
            limit: null,
        },
        like: {
            amount: 1,
            limit: null,
        },
    },
});
