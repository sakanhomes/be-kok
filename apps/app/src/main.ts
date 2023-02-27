import ExceptionFilter from '@app/core/exceptions/filter';
import { LOGGER } from '@app/core/logging/logging.module';
import { ResponseTransformerInterceptor } from '@app/core/http/response-transformer.interceptor';
import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { StackChannel } from '@app/core/logging/channels/stack.channel';
import DailyChannel from '@app/core/logging/channels/daily.channel';
import * as path from 'path';
import { ConsoleChannel } from '@app/core/logging/channels/console.channel';

function makeNestLogger(): LoggerService {
    if (process.env.ENV === 'local') {
        return new ConsoleChannel();
    }

    return new StackChannel([
        new DailyChannel({
            file: path.join(process.cwd(), 'storage/logs/kok.log'),
        }),
        new ConsoleChannel(),
    ]);
}

async function bootstrap() {
    const nestLogger = makeNestLogger();

    const app = await NestFactory.create(AppModule, {
        logger: nestLogger,
    });

    const config: ConfigService = app.get(ConfigService);
    const mainLogger: LoggerService = app.get(LOGGER);
    const port = config.get('app.port');

    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.use(cookieParser());
    app.useGlobalInterceptors(new ResponseTransformerInterceptor());
    app.useGlobalFilters(new ExceptionFilter(mainLogger));

    await app.listen(port);

    nestLogger.log(`Listening port ${port}`);
}
bootstrap();
