export function makeAwsS3FileUrl(bucket: string, path: string): string {
    return `https://${bucket}.s3.amazonaws.com/${path}`;
}