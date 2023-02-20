import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import DailyChannel from './channels/daily.channel';
import { FileChannel } from './channels/file.channel';
import { ConsoleChannel } from './channels/console.channel';
import { StackChannel } from './channels/stack.channel';

type Driver = 'single' | 'daily' | 'console' | 'stack';

interface ChannelConfig {
    driver: Driver;
    file?: string,
    channels?: string[],
}

@Injectable()
export default class LogManager {
    private drivers: Record<Driver, any> = {
        single: FileChannel,
        daily: DailyChannel,
        console: ConsoleChannel,
        stack: StackChannel,
    };
    private channels: Record<string, LoggerService> = {};

    public constructor(private readonly config: ConfigService) { }

    public channel(channel: string): LoggerService {
        if (this.channels[channel]) {
            return this.channels[channel];
        }

        const config = this.getChannelConfigOrFail(channel);
        let instance;

        if (config.driver === 'stack') {
            instance = new this.drivers.stack(config.channels.map(channel => {
                return this.channel(channel);
            }));
        } else {
            const driver = this.getDriverOrFail(config.driver);
            instance = new driver(config);
        }

        return (this.channels[channel] = instance);
    }

    private getChannelConfigOrFail(channel: string): ChannelConfig {
        const config = this.config.get(`logging.channels.${channel}`);

        if (!config) {
            // TODO Replace with app exception
            throw new Error(`Unable to find config for logging channel ${channel}`);
        }

        return config;
    }

    private getDriverOrFail(name: string) {
        const driver = this.drivers[name];

        if (!driver) {
            // TODO Replace with app exception
            throw new Error(`Unknown logging driver ${name}`);
        }

        return driver;
    }
}
