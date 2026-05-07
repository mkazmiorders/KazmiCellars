export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  if (path.endsWith("/callback")) {
    const code = url.searchParams.get("code");
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const data = await response.json();
    const token = data.access_token;
    return new Response(
      `<script>
        window.opener.postMessage(
          'authorization:github:success:{"token":"${token}","provider":"github"}',
          '*'
        );
      </script>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    scope: "repo",
  });
  return Response.redirect(
    `https://github.com/login/oauth/authorize?${params}`,
    302
  );
}
