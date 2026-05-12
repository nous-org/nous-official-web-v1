import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://nous.cr',
  output: 'server',
  trailingSlash: 'never',
  adapter: cloudflare({
    mode: 'directory',
    imageService: 'compile',
  }),
  vite: {
    server: {
      allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0'],
    },
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/node_modules/@clerk/')) return 'admin-clerk';
            if (
              id.includes('/node_modules/@tiptap/')
              || id.includes('/node_modules/prosemirror-')
            ) {
              return 'admin-editor';
            }
            if (id.includes('/node_modules/dompurify/')) return 'admin-sanitize';
          },
        },
      },
    },
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
        const withoutLocale = normalized.startsWith('/es/')
          ? normalized.slice(3) || '/'
          : normalized;
        const excluded = new Set([
          '/404',
          '/about-us',
          '/admin',
          '/contact-us',
          '/portfolio',
          '/pricing',
          '/products',
        ]);

        return !excluded.has(withoutLocale) && !normalized.startsWith('/api');
      },
      customPages: [
        'https://nous.cr/blog/building-a-more-intelligent-world',
        'https://nous.cr/es/blog/building-a-more-intelligent-world',
      ],
    }),
  ],
});
