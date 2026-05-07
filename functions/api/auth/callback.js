export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("No code provided", { status: 400 });
  }

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
      redirect_uri: "https://kazmicellars.com/api/auth/callback",
    }),
  });

  const data = await response.json();
  const token = data.access_token;
  const provider = "github";

  return new Response(
    `<!DOCTYPE html>
    <html>
    <head><title>Authorizing...</title></head>
    <body>
    <script>
      (function() {
        function receiveMessage(e) {}
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage(
          "authorization:${provider}:success:${JSON.stringify({token, provider})}",
          "https://kazmicellars.com"
        );
        setTimeout(function() { window.close(); }, 1000);
      })();
    </script>
    <p>Authorization complete. This window will close automatically.</p>
    </body>
    </html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
