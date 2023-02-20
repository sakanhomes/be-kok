import { LoggerService, LogLevel } from "@nestjs/common";

export class StackChannel implements LoggerService {
    public constructor(private readonly channels: LoggerService[]) { }

    log(message: any, context = {}): any {
        this.pushToLoggers('log', message, context);
    }

    error(message: any, context = {}): any {
        this.pushToLoggers('error', message, context);
    }

    warn(message: any, context = {}): any {
        this.pushToLoggers('warn', message, context);
    }

    debug?(message: any, context = {}): any {
        this.pushToLoggers('debug', message, context);
    }

    verbose?(message: any, context = {}): any {
        this.pushToLoggers('verbose', message, context);
    }

    private pushToLoggers(level: LogLevel, message: any, context = {}) {
        for (const channel of this.channels) {
            channel[level](message, context);
        }
    }
}