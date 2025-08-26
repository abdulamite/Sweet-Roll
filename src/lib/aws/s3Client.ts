import { s3Client } from '../../config/aws';
import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

interface FileUpload {
  filename: string;
  buffer: Buffer;
  mimetype: string;
}

interface UploadResult {
  url: string;
  key: string;
  bucket: string;
}

export class S3Service {
  private bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET_NAME || '';
    if (!this.bucket) {
      throw new Error('S3_BUCKET_NAME environment variable is required');
    }
  }

  async uploadFile(
    file: FileUpload,
    folder: string = ''
  ): Promise<UploadResult> {
    const key = `${folder}${folder ? '/' : ''}${uuidv4()}-${file.filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    try {
      await s3Client.send(command);
      return {
        url: `https://${this.bucket}.s3.amazonaws.com/${key}`,
        key,
        bucket: this.bucket,
      };
    } catch (error) {
      throw new Error(
        `S3 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await s3Client.send(command);
      return true;
    } catch (error) {
      throw new Error(
        `S3 delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getSignedUrl(key: string, expires: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      return await getSignedUrl(s3Client, command, { expiresIn: expires });
    } catch (error) {
      throw new Error(
        `S3 signed URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export default S3Service;
