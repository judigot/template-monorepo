import { parseCorsOrigins } from './env.ts';

/* Browsers use explicit origins. Deep links are trusted separately by Better Auth. */
const DEVELOPMENT_ORIGINS = [
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:8081',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:8081',
];

export function resolveAllowedOrigins(): string[] {
  const configured = parseCorsOrigins();
  if (configured === undefined || configured.length === 0) {
    return DEVELOPMENT_ORIGINS;
  }
  return configured;
}
