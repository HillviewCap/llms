// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import compress from 'astro-compress';
import sitemap from '@astrojs/sitemap';
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: 'https://llms-text.ai',
  trailingSlash: 'never',
  build: {
    format: 'file',
    assets: 'assets',
  },
  output: 'server',
  adapter: cloudflare(),
  experimental: {
    session: true, // TypeScript may show an error, but this is needed for Cloudflare KV sessions
  },
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/'),
      customPages: [
        'https://llms-text.ai/',
        'https://llms-text.ai/about',
        'https://llms-text.ai/legal',
        'https://llms-text.ai/request',
        'https://llms-text.ai/blog',
        'https://llms-text.ai/blog/a-new-web-standard',
        'https://llms-text.ai/blog/firecrawl-llmstxt-howto',
        'https://llms-text.ai/blog/how-llmstxt-are-used',
        'https://llms-text.ai/blog/how-to-use-search-api',
        'https://llms-text.ai/blog/llmstxt-ecommerce-ux',
        'https://llms-text.ai/blog/llmstxt-security-concerns',
      ],
      entryLimit: 10000,
    }),
    compress({
      CSS: true,
      HTML: true,
      JavaScript: true,
      Image: false, // Temporarily disable image compression
      SVG: true,
    }),
    tailwind(),
  ],
  vite: {
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