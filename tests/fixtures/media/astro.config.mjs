import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import { basePath, siteUrl } from '../../../src/lib/site.ts';

// This isolated project renders production components with test data. Its
// generated files stay outside the production build and type-check inputs.
export default defineConfig({
  root: fileURLToPath(new URL('../../../artifacts/media-fixture/', import.meta.url)),
  srcDir: fileURLToPath(new URL('./src/', import.meta.url)),
  publicDir: fileURLToPath(new URL('../../../public/', import.meta.url)),
  cacheDir: fileURLToPath(new URL('../../../artifacts/media-fixture/cache/', import.meta.url)),
  outDir: fileURLToPath(new URL('../../../artifacts/media-fixture/dist/', import.meta.url)),
  base: basePath,
  site: siteUrl,
  output: 'static',
});
