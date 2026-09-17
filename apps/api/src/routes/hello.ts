import type { IHelloResponse } from '@monorepo/api-client';
import { Hono } from 'hono';

export const helloRouter = new Hono();

helloRouter.get('/', (c) => {
  const response: IHelloResponse = { message: 'Hello, world!' };
  return c.json(response);
});
