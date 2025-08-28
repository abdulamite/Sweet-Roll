import Fastify from 'fastify';
import registerRoutes from './routes';
import fp from 'fastify-plugin';
import dbService from './plugins/database';

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

// Register database service plugin
fastify.register(dbService);

// Register third-party services as plugins BEFORE routes
fastify.register(
  fp(async function (fastify) {
    // const StorageService = require('./lib/storage/storageService');
    const { NotificationService } = await import(
      './lib/notifications/notificationsService'
    );
    const { QueueService } = await import('./lib/queue/queueService');
    const QueueWorker = (await import('./lib/queue/queueWorker')).default;
    const { EmailJobHandlers, UtilityJobHandlers, TestJobHandlers } =
      await import('./lib/queue/jobHandlers');

    // Initialize services
    const notificationService = new NotificationService();
    const queueService = new QueueService();
    const queueWorker = new QueueWorker(10000); // Poll every 10 seconds

    // Initialize job handlers
    const emailHandlers = new EmailJobHandlers();
    const utilityHandlers = new UtilityJobHandlers();
    const testHandlers = new TestJobHandlers();

    // Register job handlers
    queueWorker.registerHandlers({
      // Email handlers - These process the actual email sending
      'welcome-email': emailHandlers.handleWelcomeEmail.bind(emailHandlers),
      'school-welcome-email':
        emailHandlers.handleSchoolWelcomeEmail.bind(emailHandlers),
      'password-reset-email':
        emailHandlers.handlePasswordResetEmail.bind(emailHandlers),
      'notification-email':
        emailHandlers.handleNotificationEmail.bind(emailHandlers),
      'templated-email': emailHandlers.handleTemplatedEmail.bind(emailHandlers),

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
    fastify.decorate('notifications', notificationService);
    fastify.decorate('queue', queueService);
    fastify.decorate('queueWorker', queueWorker);

    // Graceful shutdown
    fastify.addHook('onClose', async () => {
      queueWorker.stop();
    });
  })
);

// Register all routes AFTER services
fastify.register(registerRoutes);

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
