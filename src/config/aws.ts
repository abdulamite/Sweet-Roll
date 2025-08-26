import { S3Client } from '@aws-sdk/client-s3';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SESClient } from '@aws-sdk/client-ses';

const awsConfig = {
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

export const s3Client = new S3Client(awsConfig);
export const sqsClient = new SQSClient(awsConfig);
export const sesClient = new SESClient(awsConfig);

export { awsConfig };
