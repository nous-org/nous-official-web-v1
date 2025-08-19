// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    envDir: './',
    ssr: {
      noExternal: ['react-dom/client', 'react-dom/server']
    },
    resolve: {
      alias: import.meta.env.PROD ? {
        "react-dom/server": "react-dom/server.edge"
      } : undefined
    }
  },

  integrations: [
    react({
      include: ['**/react/*']
    })
  ],

  output: 'server',

  adapter: cloudflare()
});