import { fileExtension } from '@app/core/helpers';

export class FileExtensionHelper {
    public static isImage(name: string): boolean {
        return ['jpg', 'jpeg', 'png'].includes(fileExtension(name));
    }
    public static isVideo(name: string): boolean {
        return ['mp4'].includes(fileExtension(name));
    }
}