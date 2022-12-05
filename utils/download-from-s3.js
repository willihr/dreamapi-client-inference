const fs = require('fs');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    endpoint: 'https://684ee036891b106ea92888e896c2b005.r2.cloudflarestorage.com',
    region: 'auto',
    credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY
    },
});

const downloadFromS3 = (bucket, key, downloadPath) => {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await s3Client.send(new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            }));
            const outputStream = fs.createWriteStream(downloadPath);
            data.Body.pipe(outputStream);
            outputStream.on('finish', resolve());
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = downloadFromS3;
