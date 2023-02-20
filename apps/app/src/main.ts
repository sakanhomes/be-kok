import ExceptionFilter from '@app/core/exceptions/filter';
import { LOGGER } from '@app/core/logging/logging.module';
import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		// TODO Pass here nest logger to view all logs
		logger: false,
	});

	const config: ConfigService = app.get(ConfigService);
	const nestLogger: LoggerService = app.get('logger.nest');
	const mainLogger: LoggerService = app.get(LOGGER);

	app.useLogger(nestLogger);
	app.useGlobalFilters(new ExceptionFilter(mainLogger));

	await app.listen(config.get('app.port'));
}
bootstrap();
