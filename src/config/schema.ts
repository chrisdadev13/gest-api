import { z } from 'zod';

export const configSchema = z.object({
  NODE_ENV: z.enum(['dev', 'prod']).default('prod'),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().url(),

  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
});

export type Config = z.infer<typeof configSchema>;
