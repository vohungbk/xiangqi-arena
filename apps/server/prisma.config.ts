import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 takes the connection URL of Migrate from this file, not from schema.prisma.
 * The migrate scripts load the shared .env with dotenv-cli, so DATABASE_URL is in the
 * environment. `prisma generate` needs no connection and the CI runs it without a database, so a
 * missing variable is an empty URL here: a migrate command then fails on the invalid URL.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
