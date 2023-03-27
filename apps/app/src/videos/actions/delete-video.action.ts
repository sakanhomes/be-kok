import { AwsS3Service } from '@app/core/aws/aws-s3.service';
import { ModelLocker } from '@app/core/orm/model-locker';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PlaylistVideo } from '../../playlists/models/playlist-video.model';
import { User } from '../../users/models/user.model';
import { VideoLike } from '../models/video-like.model';
import { VideoTrendingActivityHistory } from '../models/video-trending-activity-history.model';
import { VideoTrendingActivity } from '../models/video-trending-activity.model';
import { Video } from '../models/video.model';
import { ViewHistory } from '../models/view-history.model';

@Injectable()
export class DeleteVideoAction {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private readonly aws: AwsS3Service,
    ) {}

    public async run(video: Video): Promise<void> {
        const creator = await this.users.findOneBy({
            id: video.userId,
        });

        await this.aws.delete({
            Bucket: video.previewImageBucket,
            Key: video.previewImageFile,
        });
        await this.aws.delete({
            Bucket: video.videoBucket,
            Key: video.videoFile,
        });

        await ModelLocker.using(this.users.manager).lock(creator, async (manager, creator) => {
            creator.videosAmount = Math.max(creator.videosAmount - 1, 0);

            await Promise.all([
                this.removeVideoComments(manager, video.id),
                this.removePlaylistEntries(manager, video.id),
                this.removeVideoLikes(manager, video.id),
                this.removeTrendingActivity(manager, video.id),
                this.removeViewsHistory(manager, video.id),
                manager.remove(video),
                manager.save(creator),
            ]);
        });
    }

    private async removeVideoComments(manager: EntityManager, videoId: string): Promise<void> {
        // ATM Typeorm does not support deletion with joins
        await manager.transaction(async (manager) => {
            await manager.query(`
                delete likes from comment_likes likes
                inner join comments 
                    on comments.id = likes.commentId 
                    and comments.videoId = ?
            `, [ videoId ]);
            await manager.query(`
                delete dislikes from comment_dislikes dislikes
                inner join comments 
                    on comments.id = dislikes.commentId 
                    and comments.videoId = ?
            `, [ videoId ]);
            await manager.query(`
                delete from comments where videoId = ?
            `, [ videoId ]);
        });
    }

    private async removePlaylistEntries(manager: EntityManager, videoId: string): Promise<void> {
        await manager.getRepository(PlaylistVideo).delete({ videoId });
    }

    private async removeVideoLikes(manager: EntityManager, videoId: string): Promise<void> {
        await manager.getRepository(VideoLike).delete({ videoId });
    }

    private async removeTrendingActivity(manager: EntityManager, videoId: string): Promise<void> {
        await manager.getRepository(VideoTrendingActivity).delete({ videoId });
        await manager.getRepository(VideoTrendingActivityHistory).delete({ videoId });
    }

    private async removeViewsHistory(manager: EntityManager, videoId: string): Promise<void> {
        await manager.getRepository(ViewHistory).delete({ videoId });
    }
}