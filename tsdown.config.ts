import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { csm: 'src/csm.ts' },
  format: ['cjs'],
  target: 'node20',
  outExtension: () => ({ js: '.cjs' }),
  banner: { js: '#!/usr/bin/env node' },
  clean: true,
  sourcemap: true,
  minify: false,
  treeshake: true,
});
