export default () => ({
    awsBucket: process.env.AWS_S3_BUCKET,
    singleUploadMaxSize: 5 * 2 ** 20, // 5 MiB
    multipartUploadMaxSize: 50 * 2 ** 20, // 50 MiB
});