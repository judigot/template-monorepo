import { Hono } from 'hono';

interface IHealthResponse {
  status: 'healthy';
  timestamp: string;
}

export const healthRouter = new Hono();

healthRouter.get('/', (c) => {
  const response: IHealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
  };
  return c.json(response);
});
