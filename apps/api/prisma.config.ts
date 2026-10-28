import { defineConfig } from 'prisma/config';

const migrationUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '';
const url =
  !migrationUrl || migrationUrl.includes('schema=')
    ? migrationUrl
    : `${migrationUrl}${migrationUrl.includes('?') ? '&' : '?'}schema=levlr`;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url },
});
