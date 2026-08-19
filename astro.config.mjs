// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import decapCmsOauth from 'astro-decap-cms-oauth';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://aiwithease.net',

  output: 'server',

  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/questionnaire') &&
        !page.includes('/admin') &&
        !page.includes('/oauth'),
    }),
    decapCmsOauth(),
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel()
});