import { LoggerService } from '@nestjs/common';
import { ConsoleChannel } from './channels/console.channel';
import DailyChannel from './channels/daily.channel';
import { StackChannel } from './channels/stack.channel';
import * as path from 'path';

type Options = {
    file: string,
}

export function makeNestLogger(options: Options): LoggerService {
    if (process.env.ENV === 'local') {
        return new ConsoleChannel();
    }

    return new StackChannel([
        new DailyChannel({
            file: path.join(process.cwd(), options.file),
        }),
        new ConsoleChannel(),
    ]);
}