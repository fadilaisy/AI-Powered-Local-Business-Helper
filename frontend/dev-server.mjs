// Vite reads NODE_ENV to decide whether the build is production, which also
// drives import.meta.env.DEV. A shell that already exports
// NODE_ENV=production (common in CI images and this machine) therefore turns
// `npm run dev` into a production-mode dev server: the app then points at the
// deployed API instead of the local Express backend, so local backend changes
// are silently invisible. Force the value before Vite initialises.
process.env.NODE_ENV = 'development';

const { createServer } = await import('vite');

const server = await createServer({ configFile: './vite.config.js' });
await server.listen();
server.printUrls();
