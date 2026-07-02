import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Safely load your Express app from the server folder
const app = require('../server/server');

export default app;