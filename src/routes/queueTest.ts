import { FastifyInstance } from 'fastify';
import QueueTestHandler from '../handlers/queueTestHandler';

async function queueTestRoutes(fastify: FastifyInstance) {
  // Test single message send and receive
  fastify.post(
    '/queue/test',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            jobType: { type: 'string' },
            delay: { type: 'number', minimum: 0 },
          },
        },
      },
    },
    QueueTestHandler.testQueueFlow
  );

  // Test sending multiple messages
  fastify.post(
    '/queue/test/bulk',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            count: { type: 'number', minimum: 1, maximum: 20 },
          },
        },
      },
    },
    QueueTestHandler.testBulkQueue
  );

  // Test processing all available messages
  fastify.get(
    '/queue/test/process-all',
    QueueTestHandler.testProcessAllMessages
  );

  // Get queue worker status
  fastify.get('/queue/worker/status', QueueTestHandler.getWorkerStatus);

  // Control queue worker (start/stop)
  fastify.post(
    '/queue/worker/control',
    {
      schema: {
        body: {
          type: 'object',
          required: ['action'],
          properties: {
            action: { type: 'string', enum: ['start', 'stop'] },
          },
        },
      },
    },
    QueueTestHandler.controlWorker
  );

  // Health check for queue service
  fastify.get('/queue/health', async (request, reply) => {
    try {
      // This will test if we can instantiate the queue service
      const QueueService = (await import('../lib/queue/queueService')).default;
      const queueService = new QueueService();

      reply.send({
        status: 'healthy',
        service: 'queue',
        timestamp: new Date().toISOString(),
        config: {
          queueUrl: process.env.AWS_SQS_QUEUE_URL ? 'configured' : 'missing',
          awsRegion: process.env.AWS_REGION || 'us-west-2',
        },
      });
    } catch (error) {
      reply.code(500).send({
        status: 'unhealthy',
        service: 'queue',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });
}

export default queueTestRoutes;
