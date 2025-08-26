import { FastifyRequest, FastifyReply } from 'fastify';
import QueueService from '../lib/queue/queueService';

export class QueueTestHandler {
  /**
   * Test sending a message to SQS (worker will process it automatically)
   */
  static async testQueueFlow(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { message, jobType, delay } = request.body as {
        message?: string;
        jobType?: string;
        delay?: number;
      };

      const queueService = new QueueService();

      // Send a test message to SQS
      const testMessage = message || 'Hello from queue test!';
      const testJobType = jobType || 'test-job';
      const testDelay = delay || 0;

      request.log.info(`Sending message to queue: ${testMessage}`);

      const messageId = await queueService.enqueueJob(
        testJobType,
        {
          message: testMessage,
          timestamp: new Date().toISOString(),
          testData: {
            userId: 123,
            action: 'queue-test',
          },
        },
        testDelay
      );

      request.log.info(`Message sent with ID: ${messageId}`);

      reply.code(200).send({
        success: true,
        message: 'Message sent to queue successfully',
        note: 'The queue worker will process this message automatically within 10 seconds',
        results: {
          messageSent: {
            id: messageId,
            jobType: testJobType,
            delay: testDelay,
            content: testMessage,
          },
        },
      });
    } catch (error) {
      request.log.error(
        `Queue test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      reply.code(500).send({
        success: false,
        error: 'Queue test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Test sending multiple messages to SQS
   */
  static async testBulkQueue(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { count } = request.body as { count?: number };
      const messageCount = count || 5;

      const queueService = new QueueService();
      const results = [];

      request.log.info(`Sending ${messageCount} messages to queue...`);

      // Send multiple messages
      for (let i = 1; i <= messageCount; i++) {
        const messageId = await queueService.enqueueJob('bulk-test', {
          message: `Bulk test message ${i}`,
          sequenceNumber: i,
          timestamp: new Date().toISOString(),
        });

        results.push({
          sequence: i,
          messageId,
        });

        // Small delay between messages
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      request.log.info(`Sent ${messageCount} messages successfully`);

      reply.code(200).send({
        success: true,
        message: `Sent ${messageCount} messages to queue`,
        results,
      });
    } catch (error) {
      request.log.error(
        `Bulk queue test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      reply.code(500).send({
        success: false,
        error: 'Bulk queue test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Test reading and processing all available messages
   */
  static async testProcessAllMessages(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const queueService = new QueueService();
      const allProcessedMessages: any[] = [];

      request.log.info('Processing all available messages...');

      // Keep processing until no more messages
      let totalProcessed = 0;
      let batchCount = 0;

      while (true) {
        batchCount++;
        let batchProcessed = 0;

        await queueService.processJobs(async jobData => {
          request.log.info(
            `Processing message ${totalProcessed + 1}:`,
            jobData
          );
          allProcessedMessages.push({
            batchNumber: batchCount,
            messageNumber: totalProcessed + 1,
            data: jobData,
          });
          batchProcessed++;
          totalProcessed++;
        });

        // If no messages were processed in this batch, we're done
        if (batchProcessed === 0) {
          break;
        }

        // Small delay before next batch
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      request.log.info(
        `Finished processing. Total messages processed: ${totalProcessed}`
      );

      reply.code(200).send({
        success: true,
        message: 'Processed all available messages',
        results: {
          totalProcessed,
          batches: batchCount - 1, // Subtract 1 because last batch was empty
          messages: allProcessedMessages,
        },
      });
    } catch (error) {
      request.log.error(
        `Process all messages test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      reply.code(500).send({
        success: false,
        error: 'Process all messages test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get queue worker status
   */
  static async getWorkerStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Get the queue worker from Fastify instance
      const queueWorker = (request.server as any).queueWorker;

      if (!queueWorker) {
        return reply.code(500).send({
          success: false,
          error: 'Queue worker not available',
        });
      }

      const status = queueWorker.getStatus();

      reply.send({
        success: true,
        workerStatus: status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      request.log.error(
        `Failed to get worker status: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      reply.code(500).send({
        success: false,
        error: 'Failed to get worker status',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Start/stop queue worker
   */
  static async controlWorker(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { action } = request.body as { action: 'start' | 'stop' };
      const queueWorker = (request.server as any).queueWorker;

      if (!queueWorker) {
        return reply.code(500).send({
          success: false,
          error: 'Queue worker not available',
        });
      }

      if (action === 'start') {
        await queueWorker.start();
        reply.send({
          success: true,
          message: 'Queue worker started',
          status: queueWorker.getStatus(),
        });
      } else if (action === 'stop') {
        queueWorker.stop();
        reply.send({
          success: true,
          message: 'Queue worker stopped',
          status: queueWorker.getStatus(),
        });
      } else {
        reply.code(400).send({
          success: false,
          error: 'Invalid action. Use "start" or "stop"',
        });
      }
    } catch (error) {
      request.log.error(
        `Failed to control worker: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      reply.code(500).send({
        success: false,
        error: 'Failed to control worker',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export default QueueTestHandler;
