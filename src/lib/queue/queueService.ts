import SQSService from '../aws/sqsClient';
import { v4 as uuidv4 } from 'uuid';

export class QueueService {
  private client: SQSService;

  constructor() {
    this.client = new SQSService();
  }

  async enqueueJob(jobType: string, jobData: any, delay = 0) {
    const message = {
      type: jobType,
      data: jobData,
      timestamp: new Date().toISOString(),
      id: uuidv4(),
    };
    console.log(message);
    return await this.client.sendMessage(message, delay);
  }

  async processJobs(handler: (jobData: any) => Promise<void>) {
    const messages = await this.client.receiveMessages(10);

    for (const message of messages) {
      try {
        const jobData = JSON.parse(message.Body || '{}');
        await handler(jobData);
        if (message.ReceiptHandle) {
          await this.client.deleteMessage(message.ReceiptHandle);
        }
      } catch (error) {
        console.error('Job processing failed:', error);
        // Could implement retry logic or dead letter queue here
      }
    }
  }
}

export default QueueService;
