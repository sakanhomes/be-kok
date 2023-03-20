import { CurrentUser } from '@app/core/auth/decorators/current-user.decorator';
import { JwtAuth } from '@app/core/auth/decorators/jwt-auth.decorator';
import { Body, Controller, Get, Patch, Query, UsePipes } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../accounts/models/account.model';
import { Video } from '../videos/models/video.model';
import { VideoResource } from '../videos/resources/video.resource';
import { CreateCurrentUserResourceAction } from './actions/create-current-user-resource.action';
import { GetFavouriteVideosAction } from './actions/get-favourite-videos.action';
import { GetUserSettingsAction } from './actions/get-user-settings.action';
import { GetUserSubscribersAction } from './actions/get-user-subscribers.action';
import { GetUserSubscriptionsAction } from './actions/get-user-subscriptions.action';
import { GetViewsHistoryAction } from './actions/get-views-history.action';
import { UpdateUserSettingsAction } from './actions/update-user-settings.action';
import { UpdateUserAction } from './actions/update-user.action';
import { FiltersDto } from './dtos/filters.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './models/user.model';
import { UserResource } from './resources/user.resource';
import { FiltersValidator } from './validators/filters.validator';
import { UpdateUserSettingsValidator } from './validators/update-user-settings.validator';
import { UpdateUserValidator } from './validators/update-user.validator';

@Controller('/me')
@JwtAuth()
export class ProfileController {
    public constructor(
        private readonly resourceCreator: CreateCurrentUserResourceAction,
        @InjectRepository(Account)
        private readonly accounts: Repository<Account>,
        private readonly updater: UpdateUserAction,
        private readonly settingsGetter: GetUserSettingsAction,
        private readonly settingsUpdater: UpdateUserSettingsAction,
        private readonly subscribersGetter: GetUserSubscribersAction,
        private readonly subscriptionsGetter: GetUserSubscriptionsAction,
        private readonly favouritesGetter: GetFavouriteVideosAction,
        private readonly viewHistoryGetter: GetViewsHistoryAction,
    ) {}

    @Get('/')
    public user(@CurrentUser() user: User) {
        return this.resourceCreator.run(user);
    }

    @Patch('/')
    @UsePipes(UpdateUserValidator)
    public async update(@CurrentUser() user: User, @Body() data: UpdateUserDto) {
        await this.updater.run(user, data);

        return this.resourceCreator.run(user);
    }

    @Get('/settings')
    public async getSettings(@CurrentUser() user: User) {
        const settings = await this.settingsGetter.run(user);

        return { settings };
    }

    @Patch('/settings')
    @UsePipes(UpdateUserSettingsValidator)
    public async updateSettings(@CurrentUser() user: User, @Body() data) {
        await this.settingsUpdater.run(user, data);

        const settings = await this.settingsGetter.run(user);

        return { settings };
    }

    @Get('/subscribers')
    @UsePipes(FiltersValidator)
    public async getSubcribers(@CurrentUser() user: User, @Query() filters: FiltersDto) {
        const subscribers = await this.subscribersGetter.run(user, filters);

        return UserResource.collection(subscribers);
    }

    @Get('/subscriptions')
    @UsePipes(FiltersValidator)
    public async getSubcriptions(@CurrentUser() user: User, @Query() filters: FiltersDto) {
        const subscribers = await this.subscriptionsGetter.run(user, filters);

        return UserResource.collection(subscribers);
    }

    @Get('/favourites')
    public async getFavourites(@CurrentUser() user: User) {
        const videos = await this.favouritesGetter.run(user);

        return VideoResource.collection(videos);
    }

    @Get('/history')
    public async getHistory(@CurrentUser() user: User) {
        const views = await this.viewHistoryGetter.run(user);

        for (const day in views) {
            views[day] = VideoResource.collection(views[day]).data() as Video[];
        }

        return { views };
    }
}
