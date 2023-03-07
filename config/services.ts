export default () => ({
    'aws-s3': {
        region: process.env.AWS_S3_REGION,
        key: process.env.AWS_S3_API_KEY,
        secret: process.env.AWS_S3_SECRET,
        bucket: process.env.AWS_S3_BUCKET,
    },
});