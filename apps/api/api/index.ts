import { handle } from 'hono/vercel';
import { app } from '../src/app.ts';

/*
 * Thin Vercel Function entry point. All middleware, routes, and error
 * handling live in ../src/app.ts.
 */
export default handle(app);
