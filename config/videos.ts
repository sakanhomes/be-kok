export type VideosConfig = {
    trends: {
        lastDaysRange: number;
    },
    rewards: {
        [K in 'creation' | 'view']: {
            enabled?: boolean;
            amount: number;
            limit: number;
        };
    }
}

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
            enabled: false,
            amount: 1,
            limit: 10,
        },
    },
});