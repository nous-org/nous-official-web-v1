import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://nous.cr',
  output: 'server',
  adapter: cloudflare({
    mode: 'directory',
    runtime: {
      mode: 'local',
      bindings: {
        SESSION: 'SESSION',
      },
    },
  }),
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    ssr: {
      // Ensure these dependencies are bundled
      noExternal: ['@astrojs/cloudflare/runtime'],
    },
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
      ],
    }),
  ],
});