import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { csm: 'src/csm.ts' },
  format: ['esm'],
  target: 'node20',
  outExtension: () => ({ js: '.mjs' }),
  banner: { js: '#!/usr/bin/env node' },
  clean: true,
  sourcemap: true,
  minify: false,
  treeshake: true,
});
