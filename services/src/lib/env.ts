import { z } from 'zod';

const LOG_LEVELS = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL', 'SILENT'] as const;

const logLevelSchema = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return 'INFO';
  }

  if (typeof value === 'string') {
    return value.trim().toUpperCase();
  }

  return value;
}, z.enum(LOG_LEVELS));

const envSchema = z.object({
  LOG_LEVEL: logLevelSchema,
  SERVICE_NAME: z.string().min(1).default('lambdas'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    JSON.stringify({
      level: 'error',
      msg: 'Invalid lambda environment configuration',
      issues: parsed.error.issues,
    }),
  );
  throw parsed.error;
}

export const env = parsed.data;
