export class CreateVideoDto {
    public title: string;
    public description: string;
    public category: string;
    public duration: number;
    public isPublic: boolean;
    public videoUploadId: string;
    public previewUploadId: string;
}