import { CoreModule } from '@app/core/core.module';
import { Module } from '@nestjs/common';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as path from 'path';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@app/core/throttling/throttler.guard';

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
        ThrottlerModule.forRoot({
            ttl: 60,
            limit: 60,
        }),
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        AppService,
    ],
})
export class AppModule {}
