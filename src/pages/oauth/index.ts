import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = ({ redirect }) => {
  const params = new URLSearchParams({
    client_id: import.meta.env.OAUTH_GITHUB_CLIENT_ID,
    scope: "repo,user",
  });

  return redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
};
