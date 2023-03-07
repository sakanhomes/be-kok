export default () => ({
    awsBucket: process.env.AWS_S3_BUCKET,
    multipart: {
        minFileSize: 2 ** 20, // 5 MiB
    },
});