import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { csm: 'src/csm.ts' },
  format: ['esm'],
  target: 'node20',
  outExtensions: () => ({ js: '.js' }),
  banner: { js: '#!/usr/bin/env node' },
  clean: true,
  sourcemap: true,
  minify: false,
  treeshake: true,
});
