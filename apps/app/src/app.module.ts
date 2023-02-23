import { CoreModule } from '@app/core/core.module';
import { Module } from '@nestjs/common';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@app/core/throttling/throttler.guard';
import { SettingsModule } from './settings/settings.module';
import { AuthModule } from './auth/auth.module';

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
        SettingsModule,
        AuthModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
