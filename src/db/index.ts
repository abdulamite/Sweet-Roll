import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config';

const queryClient = postgres({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export const db = drizzle(queryClient);
