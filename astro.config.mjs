import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://nous.cr',
  output: 'server',
  adapter: cloudflare({
    mode: 'directory',
    imageService: 'compile',
  }),
  vite: {
    server: {
      allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0'],
    },
    plugins: [tailwindcss()],
    resolve: {
      alias: import.meta.env.PROD ? {
        "react-dom/server": "react-dom/server.edge"
      } : undefined
    }
  },
  integrations: [
    react(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      entryLimit: 10000,
      filter: (page) => {
        const { pathname } = new URL(page);
        const normalized = pathname.replace(/\/$/, '') || '/';
        const excluded = new Set([
          '/404',
          '/about-us',
          '/admin',
          '/contact-us',
          '/pricing',
          '/products',
        ]);

        return !excluded.has(normalized) && !normalized.startsWith('/api');
      },
      customPages: [
        'https://nous.cr/blog/building-a-more-intelligent-world',
      ],
    }),
  ],
});
