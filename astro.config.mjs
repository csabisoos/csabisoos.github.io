import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  site: 'https://csabisoos.github.io',
  base: '/',
  trailingSlash: 'ignore',
  integrations: [tailwind()],
});
