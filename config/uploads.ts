import { FileSize } from '@app/core/enums/filesize.enum';
import { Time } from '@app/core/enums/time.enum';

export default () => ({
    awsBucket: process.env.AWS_S3_BUCKET,
    singleUploadMaxSize: 5 * FileSize.MB,
    multipartUploadMaxSize: 50 * FileSize.MB,
    abandonedUploadsTtl: Time.day,
});