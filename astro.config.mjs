import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://nous.cr',
  output: 'static',
  adapter: cloudflare({
    mode: 'directory', 
  }),
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src'
      }
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
        'https://nous.cr',
        'https://nous.cr/about',
        'https://nous.cr/services',
        'https://nous.cr/products',
        'https://nous.cr/pricing',
        'https://nous.cr/blog',
        'https://nous.cr/contact',
      ]
    })
  ],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
    assets: '_astro',
  },
});