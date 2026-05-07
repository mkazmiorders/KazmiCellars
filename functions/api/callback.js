export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const code = searchParams.get('code');

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      client_id: context.env.GITHUB_CLIENT_ID,
      client_secret: context.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();
  const token = data.access_token;

  const script = `<!DOCTYPE html><html><body><script>
    (function() {
      window.opener.postMessage(
        'authorization:github:success:{"token":"${token}","provider":"github"}',
        '*'
      );
      window.close();
    })();
  <\/script></body></html>`;

  return new Response(script, { headers: { 'Content-Type': 'text/html' } });
}
