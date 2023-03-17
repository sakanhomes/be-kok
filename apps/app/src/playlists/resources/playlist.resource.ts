import { Resource } from '@app/core/http/resources/resource';
import { VideoResource } from '../../videos/resources/video.resource';
import { Playlist } from '../models/playlist.model';

export class PlaylistResource extends Resource {
    public static wrap = 'playlist';

    public constructor(private readonly playlist: Playlist) {
        super();
    }

    public data(): Record<string, any> {
        return {
            id: this.playlist.publicId,
            isDefault: this.playlist.isDefault,
            videos: VideoResource.collection(this.playlist.videos).data(),
        };
    }
}