import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://nous.cr',
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    ssr: {
      noExternal: ['@astrojs/cloudflare/runtime']
    }
  },
  integrations: [
    react(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      entryLimit: 10000,
      customPages: [
        new URL('https://nous.cr').href,
        new URL('https://nous.cr/about').href,
        new URL('https://nous.cr/services').href,
        new URL('https://nous.cr/products').href,
        new URL('https://nous.cr/pricing').href,
        new URL('https://nous.cr/blog').href,
        new URL('https://nous.cr/contact').href,
      ]
    })
  ],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
    assets: '_astro',
  },

  server: {
    host: true,
    port: 3000,
  },
});