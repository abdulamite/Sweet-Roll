import { FastifyInstance } from 'fastify';
import { SchoolHandler } from '../../handlers/schoolHandler';

export default async function schoolProtectedRoutes(fastify: FastifyInstance) {
  fastify.post('/school/logo/upload', SchoolHandler.uploadSchoolLogo);
}
