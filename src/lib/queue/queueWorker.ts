import SQSService from '../aws/sqsClient';

export interface JobHandler {
  [jobType: string]: (jobData: any) => Promise<void>;
}

export class QueueWorker {
  private sqsService: SQSService;
  private isRunning: boolean = false;
  private pollInterval: number;
  private handlers: JobHandler = {};
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(pollInterval: number = 10000) {
    // Default 10 seconds
    this.sqsService = new SQSService();
    this.pollInterval = pollInterval;
  }

  /**
   * Register a handler for a specific job type
   */
  registerHandler(jobType: string, handler: (jobData: any) => Promise<void>) {
    this.handlers[jobType] = handler;
    console.log(`Registered handler for job type: ${jobType}`);
  }

  /**
   * Register multiple handlers at once
   */
  registerHandlers(handlers: JobHandler) {
    Object.assign(this.handlers, handlers);
    console.log(
      `Registered handlers for job types: ${Object.keys(handlers).join(', ')}`
    );
  }

  /**
   * Start the queue worker - begins continuous polling
   */
  async start() {
    if (this.isRunning) {
      console.log('Queue worker is already running');
      return;
    }

    this.isRunning = true;
    console.log(
      `Queue worker started with ${this.pollInterval}ms poll interval`
    );

    // Start the polling loop
    this.poll();
  }

  /**
   * Stop the queue worker
   */
  stop() {
    if (!this.isRunning) {
      console.log('Queue worker is not running');
      return;
    }

    this.isRunning = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    console.log('Queue worker stopped');
  }

  /**
   * Main polling loop - runs continuously while worker is active
   */
  private async poll() {
    if (!this.isRunning) {
      return;
    }

    try {
      await this.processAvailableMessages();
    } catch (error) {
      console.error('Error during message processing:', error);
    }

    // Schedule next poll
    this.timeoutId = setTimeout(() => {
      this.poll();
    }, this.pollInterval);
  }

  /**
   * Process all available messages in a single poll cycle
   */
  private async processAvailableMessages() {
    try {
      const messages = await this.sqsService.receiveMessages(10); // Max 10 messages per poll

      if (messages.length === 0) {
        console.log('No messages available in queue');
        return;
      }

      console.log(`Processing ${messages.length} messages from queue`);

      // Process messages in parallel for better performance
      const processingPromises = messages.map(async message => {
        try {
          if (!message.Body) {
            console.warn('Message has no body, skipping');
            return;
          }

          const jobData = JSON.parse(message.Body);
          const jobType = jobData.type;

          if (!jobType) {
            console.warn('Message has no job type, skipping:', jobData);
            return;
          }

          const handler = this.handlers[jobType];
          if (!handler) {
            console.warn(`No handler registered for job type: ${jobType}`);
            return;
          }

          console.log(
            `Processing job: ${jobType} with ID: ${jobData.id || 'unknown'}`
          );

          // Execute the handler
          await handler(jobData.data);

          // Delete message from queue after successful processing
          if (message.ReceiptHandle) {
            await this.sqsService.deleteMessage(message.ReceiptHandle);
            console.log(
              `Successfully processed and deleted message: ${jobData.id || 'unknown'}`
            );
          }
        } catch (error) {
          console.error('Failed to process message:', error);
          console.error('Message data:', message.Body);
          // Message will remain in queue and be retried
          // You could implement dead letter queue logic here
        }
      });

      // Wait for all messages to be processed
      await Promise.all(processingPromises);
    } catch (error) {
      console.error('Error receiving messages from queue:', error);
    }
  }

  /**
   * Get worker status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      pollInterval: this.pollInterval,
      registeredHandlers: Object.keys(this.handlers),
      handlerCount: Object.keys(this.handlers).length,
    };
  }

  /**
   * Update poll interval
   */
  setPollInterval(interval: number) {
    this.pollInterval = interval;
    console.log(`Poll interval updated to ${interval}ms`);
  }
}

export default QueueWorker;
