/**
 * Precta Backend Entry Point
 * T033: Create Elysia app entry point
 */

import { app } from './app.js';

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen({ port: PORT, hostname: HOST }, () => {
  console.log(`🏥 Precta API running at http://${HOST}:${PORT}`);
  console.log(`📚 Swagger docs at http://${HOST}:${PORT}/swagger`);
});
