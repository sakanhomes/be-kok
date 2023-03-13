import { FileSize } from '@app/core/enums/filesize.enum';
import { Time } from '@app/core/enums/time.enum';

export default () => ({
    awsBucket: process.env.AWS_S3_BUCKET,
    singleUploadMaxSize: 5 * FileSize.MB,
    multipartUploadMaxSize: 50 * FileSize.MB,
    directories: {
        image: 'images',
        video: 'videos',
    },
    abandonedUploadsTtl: Time.day,
    enableAbandonedUploadsRemover: process.env.ENABLE_ABANDONED_UPLOADS_REMOVER
        ? process.env.ENABLE_ABANDONED_UPLOADS_REMOVER === 'true'
        : true,
    enableLocalAwsStub: process.env.ENABLE_LOCAL_AWS_STUB
        ? process.env.ENABLE_LOCAL_AWS_STUB === 'true'
        : false,
});