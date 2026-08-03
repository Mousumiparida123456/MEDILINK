import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';
import path from 'path';

// ensure dotenv is loaded from the correct directory
dotenv.config({ path: path.join(__dirname, '.env') });

export default defineConfig({
  earlyAccess: true,
  migrate: {
    databaseUrl: process.env.DATABASE_URL,
  },
});
