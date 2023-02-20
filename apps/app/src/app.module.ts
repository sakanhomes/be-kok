import { CoreModule } from '@app/core/core.module';
import { Module } from '@nestjs/common';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as path from 'path';

@Module({
	imports: [
		CoreModule.forRoot(),
		I18nModule.forRoot({
			resolvers: [AcceptLanguageResolver],
			fallbackLanguage: 'en',
			loaderOptions: {
				path: path.join(__dirname, 'i18n'),
			},
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
