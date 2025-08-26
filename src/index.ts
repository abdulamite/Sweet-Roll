import Fastify from 'fastify';
import registerRoutes from './routes';

const fastify = Fastify({ logger: true });

// Register plugins
fastify.register(require('@fastify/cors'));
fastify.register(require('@fastify/helmet'));
fastify.register(require('@fastify/rate-limit'));
fastify.register(require('@fastify/multipart')); // For file uploads

// Register cookie plugin
fastify.register(import('@fastify/cookie'), {
  secret: 'my-secret',
});

// Register all routes
fastify.register(registerRoutes);

// Register third-party services as plugins (optional)
fastify.register(async function (fastify) {
  // const StorageService = require('./lib/storage/storageService');
  // const NotificationService = require('./lib/notifications/notificationService');
  const { QueueService } = await import('./lib/queue/queueService');
  const QueueWorker = (await import('./lib/queue/queueWorker')).default;
  const { UtilityJobHandlers, TestJobHandlers } = await import(
    './lib/queue/jobHandlers'
  );

  // Initialize services
  const queueService = new QueueService();
  const queueWorker = new QueueWorker(10000); // Poll every 10 seconds

  // Initialize job handlers
  const utilityHandlers = new UtilityJobHandlers();
  const testHandlers = new TestJobHandlers();

  // Register job handlers
  queueWorker.registerHandlers({
    // Email handlers

    // Utility handlers
    'file-cleanup': utilityHandlers.handleFileCleanup.bind(utilityHandlers),
    'data-export': utilityHandlers.handleDataExport.bind(utilityHandlers),
    backup: utilityHandlers.handleBackup.bind(utilityHandlers),

    // Test handlers
    'test-job': testHandlers.handleTestJob.bind(testHandlers),
    'bulk-test': testHandlers.handleBulkTestJob.bind(testHandlers),
    'email-processing': testHandlers.handleEmailProcessing.bind(testHandlers),
  });

  // Start the queue worker
  await queueWorker.start();

  // fastify.decorate('storage', new StorageService());
  // fastify.decorate('notifications', new NotificationService());
  fastify.decorate('queue', queueService);
  fastify.decorate('queueWorker', queueWorker);

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    queueWorker.stop();
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Server listening on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
