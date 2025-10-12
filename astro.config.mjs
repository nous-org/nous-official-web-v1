import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://nous.cr',
  output: 'server',
  adapter: cloudflare({
    mode: 'directory',
    imageService: 'compile',
  }),
  vite: {
    server: {
      allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', 'localhost:4321', 'yql0yn-ip-152-231-141-243.tunnelmole.net', 'yql0yn-ip-152-231-141-243.tunnelmole.net:4321'],
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
      customPages: [
        'https://nous.cr',
        'https://nous.cr/about',
        'https://nous.cr/services',
        'https://nous.cr/blog',
        'https://nous.cr/contact',
      ],
    }),
  ],
});

