// Root Express entry point for Hostinger & Node.js 22+ production deployments.
// Boots ./server.ts using Node 22.18+ native TypeScript stripping, with automatic
// fallback to tsx for earlier Node 22.x runtimes (e.g. 22.0–22.17).

try {
  await import('./server.ts');
} catch (err) {
  const code = err && typeof err === 'object' ? err.code : undefined;
  const message = err instanceof Error ? err.message : String(err);
  if (
    code === 'ERR_UNKNOWN_FILE_EXTENSION' ||
    code === 'ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING' ||
    /Unknown file extension|strip-types|TypeScript/i.test(message)
  ) {
    const { register } = await import('tsx/esm/api');
    register();
    await import('./server.ts');
  } else {
    throw err;
  }
}
