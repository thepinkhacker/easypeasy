import type { APIRoute } from "astro";

export const prerender = true;

const cmsAdminRoute = import.meta.env.CMS_ADMIN_ROUTE || "/admin";

const body = `User-agent: *
Allow: /
Disallow: ${cmsAdminRoute}

# AI answer/generative engine crawlers — explicitly allowed so AI With Ease
# can be cited by AI search and chat assistants.
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

Sitemap: https://aiwithease.net/sitemap-index.xml
`;

export const GET: APIRoute = () =>
  new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
