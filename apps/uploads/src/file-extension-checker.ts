import { fileExtension } from '@app/core/helpers';

export class FileExcensionChecker {
    public static isVideo(name: string): boolean {
        return ['mp4'].includes(fileExtension(name));
    }
}