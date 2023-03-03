export default () => ({
    password: process.env.GLOBAL_SETTINGS_PASSWORD,
    settings: ['homepage.main-video-id'],
    userSettings: {
        'notifications.events.subscription': {
            type: 'boolean',
            default: true,
        },
        'notifications.events.channel-activity': {
            type: 'boolean',
            default: true,
        },
        'notifications.events.mention': {
            type: 'boolean',
            default: true,
        },
        'notifications.events.comment-reply': {
            type: 'boolean',
            default: true,
        },
        'notifications.events.sharing': {
            type: 'boolean',
            default: true,
        },
    },
});
