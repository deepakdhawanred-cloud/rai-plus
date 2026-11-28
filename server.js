// Root Express entry file for Hostinger & Node.js 22+ deployments.
// 1. Anchors working directory to the repository root (prevents CWD mismatches on Hostinger/Passenger).
// 2. Loads the pre-compiled pure-JS bundle ./dist/server.mjs (zero TypeScript runtime overhead).
// 3. Falls back cleanly to ./server.ts (or tsx) in local development mode.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure relative paths (dist/, server/private_seeds/, .data/, public/) always resolve to repo root
try {
  if (process.cwd() !== __dirname) {
    process.chdir(__dirname);
  }
} catch {
  // ignore chdir restriction if any
}

const isDevMode = process.env.NODE_ENV === 'development';
const builtServerPath = path.join(__dirname, 'dist', 'server.mjs');

async function boot() {
  // Prefer the compiled pure-JS bundle whenever present and not explicitly in Vite HMR dev mode
  if (!isDevMode && fs.existsSync(builtServerPath)) {
    await import('./dist/server.mjs');
    return;
  }

  // If dist/server.mjs is missing outside dev mode (e.g. host skipped npm run build), compile it on-the-fly with esbuild
  if (!isDevMode && !fs.existsSync(builtServerPath)) {
    try {
      const esbuild = await import('esbuild');
      fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
      await esbuild.build({
        entryPoints: [path.join(__dirname, 'server.ts')],
        bundle: true,
        platform: 'node',
        format: 'esm',
        packages: 'external',
        outfile: builtServerPath,
      });
      await import('./dist/server.mjs');
      return;
    } catch (buildErr) {
      console.warn(
        'On-the-fly server bundle fallback notice:',
        buildErr instanceof Error ? buildErr.message : buildErr,
      );
    }
  }

  // Local development (NODE_ENV=development) or fallback: import server.ts directly
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
}

boot().catch((err) => {
  console.error('Fatal Rai Plus startup error:', err);
  process.exit(1);
});
