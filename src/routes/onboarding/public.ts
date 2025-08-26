import { FastifyInstance } from 'fastify';
import { OnboardingHandler } from '../../handlers/onboardingHandler';

export default async function onboardingRoutesPublic(fastify: FastifyInstance) {
  fastify.post('/onboarding/submit', OnboardingHandler.processOnboardingForm);
}
