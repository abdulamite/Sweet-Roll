import { sqsClient } from '../../config/aws';
import {
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  Message,
} from '@aws-sdk/client-sqs';

export class SQSService {
  private queueUrl: string;

  constructor() {
    this.queueUrl = process.env.AWS_SQS_QUEUE_URL || '';
    if (!this.queueUrl) {
      throw new Error('SQS_QUEUE_URL environment variable is required');
    }
  }

  async sendMessage(
    messageBody: any,
    delaySeconds: number = 0
  ): Promise<string | undefined> {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(messageBody),
      DelaySeconds: delaySeconds,
    });

    try {
      const result = await sqsClient.send(command);
      return result.MessageId;
    } catch (error) {
      throw new Error(
        `SQS send message failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async receiveMessages(maxMessages: number = 1): Promise<Message[]> {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: maxMessages,
      WaitTimeSeconds: 20, // Long polling
      VisibilityTimeout: 30,
    });

    try {
      const result = await sqsClient.send(command);
      return result.Messages || [];
    } catch (error) {
      throw new Error(
        `SQS receive messages failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async deleteMessage(receiptHandle: string): Promise<boolean> {
    const command = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    });

    try {
      await sqsClient.send(command);
      return true;
    } catch (error) {
      throw new Error(
        `SQS delete message failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export default SQSService;
