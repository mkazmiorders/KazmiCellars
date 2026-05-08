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
  const payload = JSON.stringify({ token, provider: 'github' });

  const html = `<!doctype html>
<html>
<body>
<script>
(() => {
  window.addEventListener('message', ({ data, origin }) => {
    if (data === 'authorizing:github') {
      window.opener?.postMessage(
        'authorization:github:success:${payload}',
        origin
      );
    }
  });
  window.opener?.postMessage('authorizing:github', '*');
})();
<\/script>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
