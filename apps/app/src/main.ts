import ExceptionFilter from '@app/core/exceptions/filter';
import { ResponseTransformerInterceptor } from '@app/core/http/response-transformer.interceptor';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { makeNestLogger } from '@app/core/logging/nest-logger.factory';

async function bootstrap() {
    const nestLogger = makeNestLogger({ file: 'storage/logs/kok.log' });

    const app = await NestFactory.create(AppModule, {
        logger: nestLogger,
    });

    const config: ConfigService = app.get(ConfigService);
    const port = config.get('app.port');

    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.use(cookieParser());
    app.useGlobalInterceptors(new ResponseTransformerInterceptor());
    app.useGlobalFilters(new ExceptionFilter(nestLogger));

    await app.listen(port);

    nestLogger.log(`Listening port ${port}`);
}
bootstrap();
