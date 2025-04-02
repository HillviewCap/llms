// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import compress from 'astro-compress';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://llms-explorer.example.com',
  trailingSlash: 'never',
  build: {
    format: 'file',
    assets: 'assets',
  },
  compressHTML: true,
  integrations: [
    sitemap(),
    compress({
      CSS: true,
      HTML: true,
      JavaScript: true,
      Image: true,
      SVG: true,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
    ssr: {
      noExternal: ['@astrojs/*'],
    },
  },
});