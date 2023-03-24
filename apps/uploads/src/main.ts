import ExceptionFilter from '@app/core/exceptions/filter';
import { ResponseTransformerInterceptor } from '@app/core/http/response-transformer.interceptor';
import { makeNestLogger } from '@app/core/logging/nest-logger.factory';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { UploadsModule } from './uploads.module';

async function bootstrap() {
    const nestLogger = makeNestLogger({ file: 'storage/logs/uploads.log' });

    const app = await NestFactory.create(UploadsModule, {
        logger: nestLogger,
        bodyParser: false,
    });

    const config: ConfigService = app.get(ConfigService);
    const port = config.get('app.uploadsPort');

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
