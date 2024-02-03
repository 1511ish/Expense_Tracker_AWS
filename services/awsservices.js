const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();

exports.uploadToS3 = async (data, filename) => {
    try {
        let s3bucket = new AWS.S3({
            accessKeyId: process.env.IAM_USER_KEY,
            secretAccessKey: process.env.IAM_USER_SECRET
        })
    
        var params = {
            Bucket: process.env.BUCKET_NAME,
            Key: filename,
            Body: data,
            ACL: 'public-read'
        }

        return new Promise((resolve, reject) => {
            s3bucket.upload(params, (err, s3response) => {
                if (err) {
                    console.log('Something went wrong', err);
                    reject(err);
                } else {
                    console.log('success');
                    resolve(s3response.Location);
                }
            })
        })
    
        // const uploadResponse = await s3bucket.upload(params).promise();
        // return uploadResponse.Location;
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw error;
    }
}