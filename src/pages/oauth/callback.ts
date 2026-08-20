import type { APIRoute } from "astro";

export const prerender = false;

const ALLOWED_GITHUB_USERNAMES = (import.meta.env.OAUTH_ALLOWED_GITHUB_USERNAMES ?? "")
  .split(",")
  .map((username) => username.trim().toLowerCase())
  .filter(Boolean);

const unauthorizedResponse = () =>
  new Response(
    `<script>
      window.opener.postMessage("authorization:github:error:Not authorized", "*");
    </script>`,
    { headers: { "Content-Type": "text/html" }, status: 403 },
  );

export const GET: APIRoute = async ({ url, redirect }) => {
  const data = {
    code: url.searchParams.get("code"),
    client_id: import.meta.env.OAUTH_GITHUB_CLIENT_ID,
    client_secret: import.meta.env.OAUTH_GITHUB_CLIENT_SECRET,
  };

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GitHub OAuth error:", response.status, errorText);
      throw new Error(`GitHub OAuth error! status: ${response.status}`);
    }

    const body = await response.json();

    if (body.error) {
      console.error("GitHub OAuth error response:", body);
      throw new Error(`GitHub OAuth error: ${body.error_description || body.error}`);
    }

    if (!body.access_token) {
      console.error("No access_token in GitHub response:", body);
      throw new Error("No access token received from GitHub");
    }

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${body.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!userResponse.ok) {
      console.error("Failed to fetch GitHub user:", userResponse.status);
      return unauthorizedResponse();
    }

    const githubUser = await userResponse.json();
    const login = (githubUser.login ?? "").toLowerCase();

    if (!ALLOWED_GITHUB_USERNAMES.includes(login)) {
      console.warn(`Rejected backstage login from unauthorized GitHub account: ${githubUser.login}`);
      return unauthorizedResponse();
    }

    const content = {
      token: body.access_token,
      provider: "github",
    };

    const expectedOrigin = url.origin;

    const script = `
      <script>
        const expectedOrigin = ${JSON.stringify(expectedOrigin)};

        const receiveMessage = (message) => {
          if (message.origin !== expectedOrigin) return;

          window.opener.postMessage(
            'authorization:${content.provider}:success:${JSON.stringify(content)}',
            message.origin
          );

          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);

        window.opener.postMessage("authorizing:${content.provider}", "*");
      </script>
    `;

    return new Response(script, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    console.error(err);
    return redirect(`/?error=${encodeURIComponent("oauth_failed")}`);
  }
};
