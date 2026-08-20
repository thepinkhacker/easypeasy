// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import decapCmsOauth from 'astro-decap-cms-oauth';

import vercel from '@astrojs/vercel';

const { CMS_ADMIN_ROUTE } = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const cmsAdminRoute = CMS_ADMIN_ROUTE || '/admin';

// https://astro.build/config
export default defineConfig({
  site: 'https://aiwithease.net',

  output: 'server',

  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/questionnaire') &&
        !page.includes(cmsAdminRoute) &&
        !page.includes('/oauth'),
    }),
    decapCmsOauth({
      adminRoute: cmsAdminRoute,
      configPath: 'config/decap-cms.yml',
      oauthDisabled: true,
    }),
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel()
});