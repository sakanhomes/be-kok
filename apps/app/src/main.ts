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
	const logger: LoggerService = app.get('logger.nest');

	app.useLogger(logger);
	
	await app.listen(config.get('app.port'));
}
bootstrap();
